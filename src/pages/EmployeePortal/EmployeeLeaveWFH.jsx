import { useState } from "react";
import { FaCalendarCheck, FaHome, FaPlaneDeparture } from "react-icons/fa";
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

function EmployeeLeaveWFH({ activePage, onNavigate }) {
  const [activeModal, setActiveModal] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [requests, setRequests] = useState(initialRequests);
  const [leaveForm, setLeaveForm] = useState({
    type: "Casual Leave",
    fromDate: "",
    toDate: "",
    reason: "",
  });
  const [wfhForm, setWfhForm] = useState({
    date: "",
    reason: "",
    project: "",
  });

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleLeaveChange = (event) => {
    const { name, value } = event.target;
    setLeaveForm((current) => ({ ...current, [name]: value }));
  };

  const handleWfhChange = (event) => {
    const { name, value } = event.target;
    setWfhForm((current) => ({ ...current, [name]: value }));
  };

  const handleLeaveSubmit = (event) => {
    event.preventDefault();
    setRequests((current) => [
      {
        title: leaveForm.type,
        meta: `Pending - ${leaveForm.fromDate || "Selected date"}`,
      },
      ...current,
    ]);
    setLeaveForm({ type: "Casual Leave", fromDate: "", toDate: "", reason: "" });
    setSuccessMessage("Leave request submitted successfully.");
    closeModal();
  };

  const handleWfhSubmit = (event) => {
    event.preventDefault();
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
