import { useState } from "react";
import { FaCalendarCheck } from "react-icons/fa";
import { addEmployeeDecisionNotification, formatNotificationDate } from "../../utils/requestNotifications";
import HRPortalLayout from "./HRPortalLayout";

const leaveRequests = [
  {
    name: "Sandipan Mondal",
    type: "Medical Leave",
    dates: "Jun 18 - Jun 19",
    days: "2",
    status: "Pending",
    reason: "Fever and doctor consultation.",
    pdfFileName: "medical-certificate.pdf",
  },
  {
    name: "Priya Nair",
    type: "Annual Leave",
    dates: "Jun 21 - Jun 24",
    days: "4",
    status: "Pending",
    reason: "Family function.",
    pdfFileName: "",
  },
  {
    name: "Arjun Mehta",
    type: "Personal Leave",
    dates: "Jun 25",
    days: "1",
    status: "Pending",
    reason: "Personal work.",
    pdfFileName: "",
  },
];

const hrLeaveRequestStorageKey = "hrLeaveRequests";

const getStoredLeaveRequests = () => {
  try {
    return JSON.parse(localStorage.getItem(hrLeaveRequestStorageKey) || "[]");
  } catch {
    return [];
  }
};

const getRequestKey = (request) =>
  request.id || `${request.email || request.name}-${request.type}-${request.dates}-${request.reason}`;

function HRLeaveApproval({ activePage, onNavigate }) {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [allLeaveRequests, setAllLeaveRequests] = useState(() => [...getStoredLeaveRequests(), ...leaveRequests]);

  const updateStoredLeaveStatus = (request, status) => {
    const requestKey = getRequestKey(request);
    const decisionDate = formatNotificationDate();
    const storedRequests = getStoredLeaveRequests();
    const updatedStoredRequests = storedRequests.map((storedRequest) =>
      getRequestKey(storedRequest) === requestKey
        ? { ...storedRequest, status, decisionDate }
        : storedRequest
    );

    localStorage.setItem(hrLeaveRequestStorageKey, JSON.stringify(updatedStoredRequests));
    setAllLeaveRequests((current) =>
      current.map((currentRequest) =>
        getRequestKey(currentRequest) === requestKey
          ? { ...currentRequest, status, decisionDate }
          : currentRequest
      )
    );
    setSelectedRequest((current) =>
      current && getRequestKey(current) === requestKey ? { ...current, status, decisionDate } : current
    );

    if (request.email) {
      addEmployeeDecisionNotification({
        type: "Leave",
        employeeEmail: request.email,
        status,
        decisionDate,
        detail: `${request.type} for ${request.dates}`,
      });
    }
  };

  return (
    <HRPortalLayout activePage={activePage} eyebrow="Leave Approval" title="Leave Approval" onNavigate={onNavigate}>
      <article className="hr-panel">
        <div className="hr-panel-heading">
          <div><span>Pending</span><h2>Pending Leave Requests</h2></div>
          <FaCalendarCheck />
        </div>
        <div className="hr-table-wrap">
          <table className="hr-table">
            <thead>
              <tr><th>Employee</th><th>Leave Type</th><th>Dates</th><th>Days</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {allLeaveRequests.map((request, index) => (
                <tr key={`${request.name}-${request.dates}-${index}`}>
                  <td>{request.name}</td><td>{request.type}</td><td>{request.dates}</td><td>{request.days}</td>
                  <td><span className={`hr-status ${request.status.toLowerCase()}`}>{request.status}</span></td>
                  <td>
                    <div className="hr-action-pair">
                      <button className="outline" type="button" onClick={() => setSelectedRequest(request)}>View</button>
                      <button type="button" onClick={() => updateStoredLeaveStatus(request, "Approved")}>Approve</button>
                      <button className="danger" type="button" onClick={() => updateStoredLeaveStatus(request, "Rejected")}>Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {selectedRequest && (
        <div className="hr-modal-backdrop" role="presentation" onMouseDown={() => setSelectedRequest(null)}>
          <section
            className="hr-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="leave-details-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="hr-modal-close" type="button" onClick={() => setSelectedRequest(null)} aria-label="Close leave details">
              &times;
            </button>
            <div className="hr-modal-heading">
              <span>Leave Details</span>
              <h2 id="leave-details-title">{selectedRequest.name}</h2>
            </div>
            <div className="hr-detail-list">
              <p><strong>Employee name</strong><span>{selectedRequest.name}</span></p>
              <p><strong>Leave type</strong><span>{selectedRequest.type}</span></p>
              <p><strong>Dates</strong><span>{selectedRequest.dates}</span></p>
              <p><strong>Days</strong><span>{selectedRequest.days}</span></p>
              <p><strong>Status</strong><span>{selectedRequest.status}</span></p>
              <p><strong>Leave reason</strong><span>{selectedRequest.reason}</span></p>
              <p>
                <strong>Supporting Document</strong>
                <span>
                  {selectedRequest.pdfFileName || "No document uploaded"}
                  {selectedRequest.pdfFileName && (
                    <span className="hr-document-actions">
                      <button type="button">View</button>
                      <button type="button">Download</button>
                    </span>
                  )}
                </span>
              </p>
            </div>
          </section>
        </div>
      )}
    </HRPortalLayout>
  );
}

export default HRLeaveApproval;
