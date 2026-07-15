import { useCallback, useEffect, useState } from "react";
import { FaCalendarCheck, FaPlaneDeparture } from "react-icons/fa";
import { getCurrentUser } from "../../utils/authStorage";
import { createLeaveRequestRemote, getLeaveRequestsRemote } from "../../utils/hrPortalApi";
import { formatNotificationDate } from "../../utils/requestNotifications";
import { uploadFileToCloudinary } from "../../utils/uploadApi";
import HRPortalLayout from "./HRPortalLayout";

const maxUploadBytes = 5 * 1024 * 1024;

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

function HRLeaveWFHRequest({ activePage, onNavigate }) {
  const [activeModal, setActiveModal] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [fileError, setFileError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hrLeaveRequests, setHrLeaveRequests] = useState([]);
  const [leaveForm, setLeaveForm] = useState({
    type: "Casual Leave",
    fromDate: "",
    toDate: "",
    reason: "",
    fileName: "",
    fileData: "",
    fileUrl: "",
    filePublicId: "",
    fileResourceType: "",
    fileType: "",
    fileSize: 0,
  });
  const approvedLeaveCount = hrLeaveRequests.filter((request) => request.status === "Approved").length;
  const pendingLeaveCount = hrLeaveRequests.filter((request) => (request.status || "Pending") === "Pending").length;
  const leaveItems = [
    { label: "Leave Balance", value: "12 Days", note: "Current year", icon: <FaPlaneDeparture /> },
    { label: "Approved Requests", value: String(approvedLeaveCount).padStart(2, "0"), note: "Admin approved", icon: <FaCalendarCheck /> },
    { label: "Pending Requests", value: String(pendingLeaveCount).padStart(2, "0"), note: "Awaiting admin", icon: <FaCalendarCheck /> },
  ];

  const refreshHrLeaveRequests = useCallback(() => {
    const currentUser = getCurrentUser();
    const currentEmail = String(currentUser.email || "").trim().toLowerCase();

    getLeaveRequestsRemote()
      .then((requests) => {
        const ownHrRequests = (Array.isArray(requests) ? requests : [])
          .filter((request) =>
            String(request.requesterRole || "").toLowerCase() === "hr" &&
            String(request.email || "").trim().toLowerCase() === currentEmail
          )
          .sort((a, b) =>
            String(b.createdAt || b.requestDate || "").localeCompare(String(a.createdAt || a.requestDate || ""))
          );

        setHrLeaveRequests(ownHrRequests);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshHrLeaveRequests();

    window.addEventListener("hr-leave-request-updated", refreshHrLeaveRequests);
    window.addEventListener("storage", refreshHrLeaveRequests);

    return () => {
      window.removeEventListener("hr-leave-request-updated", refreshHrLeaveRequests);
      window.removeEventListener("storage", refreshHrLeaveRequests);
    };
  }, [refreshHrLeaveRequests]);

  const closeModal = () => {
    setActiveModal(null);
    setFileError("");
    setSubmitError("");
    setIsSubmitting(false);
  };

  const handleFileChange = async (event, target) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > maxUploadBytes) {
      setFileError("File is too large. Please upload a file under 5 MB.");
      event.target.value = "";
      return;
    }

    setFileError("Uploading file to Cloudinary...");
    setSubmitError("");

    try {
      const upload = await uploadFileToCloudinary(file, {
        folder: `assignopedia/${target === "leave" ? "leave-requests" : "wfh-requests"}`,
        resourceType: "auto",
      });
      const details = {
        fileName: file.name,
        fileData: upload.url,
        fileUrl: upload.url,
        filePublicId: upload.publicId,
        fileResourceType: upload.resourceType,
        fileType: file.type || "application/octet-stream",
        fileSize: upload.bytes || file.size,
      };

      setFileError("");

      setLeaveForm((current) => ({
        ...current,
        ...details,
        pdfFileName: file.name,
        pdfData: upload.url,
        pdfUrl: upload.url,
        pdfPublicId: upload.publicId,
      }));
    } catch (error) {
      setFileError(error.message || "Cloudinary upload failed.");
      event.target.value = "";
    }
  };

  const handleLeaveSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");

    if (fileError) {
      setSubmitError("Please fix the file upload error before submitting.");
      return;
    }

    setIsSubmitting(true);
    const currentUser = getCurrentUser();
    const requestDate = formatNotificationDate();

    try {
      await createLeaveRequestRemote({
        id: `leave-${Date.now()}`,
        name: currentUser.name,
        email: currentUser.email,
        requesterRole: "hr",
        approvalAudience: "admin",
        type: leaveForm.type,
        dates: `${leaveForm.fromDate} - ${leaveForm.toDate}`,
        days: getLeaveDays(leaveForm.fromDate, leaveForm.toDate),
        status: "Pending",
        reason: leaveForm.reason,
        ...leaveForm,
        requestDate,
      });
      window.dispatchEvent(new CustomEvent("hr-leave-request-updated"));
      refreshHrLeaveRequests();
      setLeaveForm({
        type: "Casual Leave",
        fromDate: "",
        toDate: "",
        reason: "",
        fileName: "",
        fileData: "",
        fileUrl: "",
        filePublicId: "",
        fileResourceType: "",
        fileType: "",
        fileSize: 0,
      });
      setSuccessMessage("Leave request submitted to Admin for approval.");
      closeModal();
    } catch (error) {
      setSubmitError(`Leave request was not saved in MongoDB: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <HRPortalLayout activePage={activePage} eyebrow="Leave Request" title="Leave Request" onNavigate={onNavigate}>
      <section className="leave-action-panel">
        <div>
          <span>Admin Approval</span>
          <h2>Apply for leave</h2>
          <p>Submit your HR leave request from your registered HR account. Admin will approve or reject it.</p>
        </div>
        <div className="leave-action-buttons">
          <button className="hr-apply-leave-button" type="button" onClick={() => setActiveModal("leave")}>
            Apply Leave
          </button>
        </div>
      </section>

      {successMessage && <div className="request-success" role="status">{successMessage}</div>}

      <section className="hr-leave-insight-grid" aria-label="HR leave summary">
        {leaveItems.map((item) => (
          <article className="hr-leave-stat-card" key={item.label}>
            <div>{item.icon}</div>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.note}</small>
          </article>
        ))}
      </section>

      <section className="hr-leave-dashboard-grid">
        <article className="hr-leave-panel hr-leave-recent-panel">
          <div className="hr-leave-panel-heading">
            <div>
              <span>Requests</span>
              <h3>Recent Leave Requests</h3>
            </div>
          </div>
          <div className="hr-leave-timeline-list">
            {hrLeaveRequests.length ? hrLeaveRequests.map((request) => (
              <div key={request.id || `${request.type}-${request.dates}`}>
                <span>
                  <strong>{request.type}</strong>
                  <small>{request.reason}</small>
                  {request.decisionComment && <em>{request.decisionComment}</em>}
                </span>
                <b>{request.status || "Pending"} - {request.dates}</b>
              </div>
            )) : (
              <div>
                <span>
                  <strong>No HR leave requests submitted yet.</strong>
                  <small>New leave requests will appear here after submission.</small>
                </span>
                <b>Waiting</b>
              </div>
            )}
          </div>
        </article>

        <article className="hr-leave-panel hr-leave-policy-panel">
          <div className="hr-leave-panel-heading">
            <div>
              <span>Policy</span>
              <h3>Quick Rules</h3>
            </div>
          </div>
          <p className="hr-leave-policy-copy">
            Submit leave requests at least one working day in advance. Admin will review HR leave requests and update the approval status with an optional comment.
          </p>
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

            <div className="request-modal-heading">
              <span>Leave Request</span>
              <h3 id="request-modal-title">Apply Leave</h3>
            </div>
            <form className="request-form" onSubmit={handleLeaveSubmit}>
              <label>
                <span>Leave Type</span>
                <select name="type" value={leaveForm.type} onChange={(event) => setLeaveForm((current) => ({ ...current, type: event.target.value }))} required>
                  <option>Casual Leave</option>
                  <option>Sick Leave</option>
                  <option>Emergency Leave</option>
                </select>
              </label>
              <div className="request-form-row">
                <label>
                  <span>From Date</span>
                  <input type="date" value={leaveForm.fromDate} onChange={(event) => setLeaveForm((current) => ({ ...current, fromDate: event.target.value }))} required />
                </label>
                <label>
                  <span>To Date</span>
                  <input type="date" value={leaveForm.toDate} onChange={(event) => setLeaveForm((current) => ({ ...current, toDate: event.target.value }))} required />
                </label>
              </div>
              <label>
                <span>Reason</span>
                <textarea value={leaveForm.reason} onChange={(event) => setLeaveForm((current) => ({ ...current, reason: event.target.value }))} rows="4" required />
              </label>
              <label>
                <span>Supporting File</span>
                <input type="file" onChange={(event) => handleFileChange(event, "leave")} />
                {leaveForm.fileName && <strong className="request-file-name">{leaveForm.fileName}</strong>}
                {fileError && <small className="request-error-text">{fileError}</small>}
              </label>
              {submitError && <small className="request-error-text">{submitError}</small>}
              <button className="request-submit-btn hr-submit-admin-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit to Admin"}
              </button>
            </form>
          </section>
        </div>
      )}
    </HRPortalLayout>
  );
}

export default HRLeaveWFHRequest;
