import { useState } from "react";
import { FaCalendarCheck, FaHome, FaPlaneDeparture } from "react-icons/fa";
import { getCurrentUser } from "../../utils/authStorage";
import { createLeaveRequestRemote, createWfhRequestRemote } from "../../utils/hrPortalApi";
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
  const [wfhForm, setWfhForm] = useState({
    date: "",
    reason: "",
    project: "",
    fileName: "",
    fileData: "",
    fileUrl: "",
    filePublicId: "",
    fileResourceType: "",
    fileType: "",
    fileSize: 0,
  });

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

      if (target === "leave") {
        setLeaveForm((current) => ({
          ...current,
          ...details,
          pdfFileName: file.name,
          pdfData: upload.url,
          pdfUrl: upload.url,
          pdfPublicId: upload.publicId,
        }));
        return;
      }

      setWfhForm((current) => ({ ...current, ...details }));
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

  const handleWfhSubmit = async (event) => {
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
      await createWfhRequestRemote({
        id: `wfh-${Date.now()}`,
        name: currentUser.name,
        email: currentUser.email,
        requesterRole: "hr",
        approvalAudience: "admin",
        date: wfhForm.date,
        task: wfhForm.project,
        reason: wfhForm.reason,
        status: "Pending",
        ...wfhForm,
        requestDate,
      });
      window.dispatchEvent(new CustomEvent("employee-wfh-request-updated"));
      setWfhForm({
        date: "",
        reason: "",
        project: "",
        fileName: "",
        fileData: "",
        fileUrl: "",
        filePublicId: "",
        fileResourceType: "",
        fileType: "",
        fileSize: 0,
      });
      setSuccessMessage("WFH request submitted to Admin for approval.");
      closeModal();
    } catch (error) {
      setSubmitError(`WFH request was not saved in MongoDB: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <HRPortalLayout activePage={activePage} eyebrow="Leave / WFH" title="Leave and WFH Requests" onNavigate={onNavigate}>
      <section className="leave-action-panel">
        <div>
          <span>Admin Approval</span>
          <h2>Apply for leave or work from home</h2>
          <p>Submit HR requests from your registered HR account. Admin will approve or reject them.</p>
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

      {successMessage && <div className="request-success" role="status">{successMessage}</div>}

      <section className="hr-summary-grid" aria-label="HR request summary">
        {[
          { label: "Leave Request", value: "Admin", note: "Approval owner", icon: <FaPlaneDeparture /> },
          { label: "WFH Request", value: "Admin", note: "Approval owner", icon: <FaHome /> },
          { label: "Status", value: "Pending", note: "Until reviewed", icon: <FaCalendarCheck /> },
        ].map((item) => (
          <article className="hr-summary-card" key={item.label}>
            <div className="hr-summary-icon">{item.icon}</div>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.note}</small>
          </article>
        ))}
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
                  <button className="request-submit-btn" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit to Admin"}
                  </button>
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
                    <input type="date" value={wfhForm.date} onChange={(event) => setWfhForm((current) => ({ ...current, date: event.target.value }))} required />
                  </label>
                  <label>
                    <span>Work reason</span>
                    <textarea value={wfhForm.reason} onChange={(event) => setWfhForm((current) => ({ ...current, reason: event.target.value }))} rows="4" required />
                  </label>
                  <label>
                    <span>Project / Task name</span>
                    <input type="text" value={wfhForm.project} onChange={(event) => setWfhForm((current) => ({ ...current, project: event.target.value }))} required />
                  </label>
                  <label>
                    <span>Supporting File</span>
                    <input type="file" onChange={(event) => handleFileChange(event, "wfh")} />
                    {wfhForm.fileName && <strong className="request-file-name">{wfhForm.fileName}</strong>}
                    {fileError && <small className="request-error-text">{fileError}</small>}
                  </label>
                  {submitError && <small className="request-error-text">{submitError}</small>}
                  <button className="request-submit-btn" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit to Admin"}
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </HRPortalLayout>
  );
}

export default HRLeaveWFHRequest;
