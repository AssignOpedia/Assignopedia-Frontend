import { useState } from "react";
import { FaCalendarCheck, FaHome, FaPlaneDeparture } from "react-icons/fa";
import { getCurrentUser } from "../../utils/authStorage";
import { saveEmployeeWfhRequest } from "../../utils/employeeDashboardMetrics";
import { addHrRequestNotification, formatNotificationDate } from "../../utils/requestNotifications";
import EmployeePortalLayout from "./EmployeePortalLayout";

const leaveItems = [
  { label: "Leave Balance", value: "12 Days", icon: <FaPlaneDeparture /> },
  { label: "WFH Used", value: "04 Days", icon: <FaHome /> },
  { label: "Approved Requests", value: "06", icon: <FaCalendarCheck /> },
];

const initialRequests = [
  { title: "Casual Leave", meta: "Approved - Jun 21" },
  { title: "WFH Request", meta: "Approved - Jun 18" },
  { title: "Sick Leave", meta: "Reviewed - May 30" },
];

const hrLeaveRequestStorageKey = "hrLeaveRequests";

const getLeaveDays = (fromDate, toDate) => {
  if (!fromDate || !toDate) {
    return "1";
  }

  const start = new Date(fromDate);
  const end = new Date(toDate);
  const difference = end.getTime() - start.getTime();

  if (Number.isNaN(difference) || difference < 0) {
    return "1";
  }

  return String(Math.floor(difference / 86400000) + 1);
};

function EmployeeLeaveWFH({ activePage, onNavigate }) {
  const [activeModal, setActiveModal] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [pdfError, setPdfError] = useState("");
  const [requests, setRequests] = useState(initialRequests);
  const [leaveForm, setLeaveForm] = useState({
    type: "Casual Leave",
    fromDate: "",
    toDate: "",
    reason: "",
    pdfFileName: "",
  });
  const [wfhForm, setWfhForm] = useState({
    date: "",
    reason: "",
    project: "",
  });

  const closeModal = () => {
    setActiveModal(null);
    setPdfError("");
  };

  const handleLeaveChange = (event) => {
    const { name, value } = event.target;
    setLeaveForm((current) => ({ ...current, [name]: value }));
  };

  const handleWfhChange = (event) => {
    const { name, value } = event.target;
    setWfhForm((current) => ({ ...current, [name]: value }));
  };

  const handlePdfChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setPdfError("Only PDF files are allowed.");
      setLeaveForm((current) => ({ ...current, pdfFileName: "" }));
      event.target.value = "";
      return;
    }

    setPdfError("");
    setLeaveForm((current) => ({ ...current, pdfFileName: file.name }));
  };

  const handleLeaveSubmit = (event) => {
    event.preventDefault();
    const currentUser = getCurrentUser();
    const requestDate = formatNotificationDate();
    const leaveRequest = {
      id: `leave-${Date.now()}`,
      name: currentUser.name,
      email: currentUser.email,
      type: leaveForm.type,
      dates: `${leaveForm.fromDate} - ${leaveForm.toDate}`,
      days: getLeaveDays(leaveForm.fromDate, leaveForm.toDate),
      status: "Pending",
      reason: leaveForm.reason,
      pdfFileName: leaveForm.pdfFileName,
      requestDate,
    };
    const savedRequests = JSON.parse(localStorage.getItem(hrLeaveRequestStorageKey) || "[]");

    localStorage.setItem(
      hrLeaveRequestStorageKey,
      JSON.stringify([leaveRequest, ...savedRequests])
    );
    addHrRequestNotification({
      type: "Leave",
      employeeName: currentUser.name,
      requestDate,
      detail: `${leaveForm.type} for ${leaveRequest.dates}`,
    });
    setRequests((current) => [
      {
        title: leaveForm.type,
        meta: `Pending - ${leaveForm.fromDate || "Selected date"}`,
      },
      ...current,
    ]);
    setLeaveForm({ type: "Casual Leave", fromDate: "", toDate: "", reason: "", pdfFileName: "" });
    setSuccessMessage("Leave request submitted successfully.");
    closeModal();
  };

  const handleWfhSubmit = (event) => {
    event.preventDefault();
    const currentUser = getCurrentUser();
    const requestDate = formatNotificationDate();
    saveEmployeeWfhRequest({
      id: `wfh-${Date.now()}`,
      name: currentUser.name,
      email: currentUser.email,
      date: wfhForm.date,
      task: wfhForm.project,
      reason: wfhForm.reason,
      status: "Pending",
      requestDate,
    });
    addHrRequestNotification({
      type: "WFH",
      employeeName: currentUser.name,
      requestDate,
      detail: `${wfhForm.project} on ${wfhForm.date}`,
    });
    setRequests((current) => [
      {
        title: "WFH Request",
        meta: `Pending - ${wfhForm.date || "Selected date"}`,
      },
      ...current,
    ]);
    setWfhForm({ date: "", reason: "", project: "" });
    setSuccessMessage("WFH request submitted successfully.");
    closeModal();
  };

  return (
    <EmployeePortalLayout activePage={activePage} eyebrow="Leave / WFH" title="Leave and WFH" onNavigate={onNavigate}>
      <section className="leave-action-panel">
        <div>
          <span>Request Center</span>
          <h2>Apply for leave or work from home</h2>
          <p>Submit a request for approval. New requests will appear as pending in your recent list.</p>
        </div>
        <div className="leave-action-buttons">
          <button type="button" onClick={() => setActiveModal("leave")}>
            Apply Leave
          </button>
          <button type="button" onClick={() => setActiveModal("wfh")}>
            Apply WFH
          </button>
        </div>
      </section>

      {successMessage && (
        <div className="request-success" role="status">
          {successMessage}
        </div>
      )}

      <section className="portal-insight-grid">
        {leaveItems.map((item) => (
          <article className="attendance-card" key={item.label}>
            <div className="card-icon">{item.icon}</div>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>Current year</small>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="portal-card">
          <div className="card-heading"><div><span>Requests</span><h3>Recent Leave Requests</h3></div></div>
          <div className="timeline-list">
            {requests.map((request, index) => (
              <p key={`${request.title}-${request.meta}-${index}`}>
                <strong>{request.title}</strong>
                <span>{request.meta}</span>
              </p>
            ))}
          </div>
        </article>
        <article className="portal-card">
          <div className="card-heading"><div><span>Policy</span><h3>Quick Rules</h3></div></div>
          <p className="portal-copy">Submit leave requests at least one working day in advance. WFH requests are approved by the team leader based on project needs.</p>
        </article>
      </section>

      {activeModal && (
        <div className="request-modal-backdrop" role="presentation" onMouseDown={closeModal}>
          <section
            className="request-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="request-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="request-modal-close" type="button" onClick={closeModal} aria-label="Close request form">
              &times;
            </button>

            {activeModal === "leave" ? (
              <>
                <div className="request-modal-heading">
                  <span>Leave Request</span>
                  <h3 id="request-modal-title">Apply Leave</h3>
                </div>
                <form className="request-form" onSubmit={handleLeaveSubmit}>
                  <label>
                    <span>Leave Type</span>
                    <select name="type" value={leaveForm.type} onChange={handleLeaveChange} required>
                      <option>Casual Leave</option>
                      <option>Sick Leave</option>
                      <option>Emergency Leave</option>
                    </select>
                  </label>
                  <div className="request-form-row">
                    <label>
                      <span>From Date</span>
                      <input type="date" name="fromDate" value={leaveForm.fromDate} onChange={handleLeaveChange} required />
                    </label>
                    <label>
                      <span>To Date</span>
                      <input type="date" name="toDate" value={leaveForm.toDate} onChange={handleLeaveChange} required />
                    </label>
                  </div>
                  <label>
                    <span>Reason</span>
                    <textarea name="reason" value={leaveForm.reason} onChange={handleLeaveChange} rows="4" required />
                  </label>
                  <label>
                    <span>Supporting Document (PDF)</span>
                    <input type="file" accept=".pdf,application/pdf" onChange={handlePdfChange} />
                    <small className="request-helper-text">Upload supporting document if required.</small>
                    {leaveForm.pdfFileName && <strong className="request-file-name">{leaveForm.pdfFileName}</strong>}
                    {pdfError && <small className="request-error-text">{pdfError}</small>}
                  </label>
                  <button className="request-submit-btn" type="submit">Submit</button>
                </form>
              </>
            ) : (
              <>
                <div className="request-modal-heading">
                  <span>WFH Request</span>
                  <h3 id="request-modal-title">Apply WFH</h3>
                </div>
                <form className="request-form" onSubmit={handleWfhSubmit}>
                  <label>
                    <span>WFH Date</span>
                    <input type="date" name="date" value={wfhForm.date} onChange={handleWfhChange} required />
                  </label>
                  <label>
                    <span>Work reason</span>
                    <textarea name="reason" value={wfhForm.reason} onChange={handleWfhChange} rows="4" required />
                  </label>
                  <label>
                    <span>Project / Task name</span>
                    <input type="text" name="project" value={wfhForm.project} onChange={handleWfhChange} required />
                  </label>
                  <button className="request-submit-btn" type="submit">Submit</button>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </EmployeePortalLayout>
  );
}

export default EmployeeLeaveWFH;
