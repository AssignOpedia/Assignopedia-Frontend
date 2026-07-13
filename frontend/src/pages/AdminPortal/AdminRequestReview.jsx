import { useCallback, useEffect, useState } from "react";
import { FaCalendarCheck, FaDownload, FaEye, FaLaptopHouse } from "react-icons/fa";
import {
  decideLeaveRequestRemote,
  decideWfhRequestRemote,
  getLeaveRequestDocumentUrl,
  getLeaveRequestsRemote,
  getWfhRequestDocumentUrl,
  getWfhRequestsRemote,
} from "../../utils/hrPortalApi";
import { itemMatchesSearch, usePortalSearchQuery } from "../../utils/portalSearch";
import { getCurrentUser } from "../../utils/authStorage";

const isRoleRequest = (request, requesterRole) =>
  String(request.requesterRole || "employee").toLowerCase() === requesterRole;

const getRequestKey = (request) => request.id || `${request.email}-${request.type || request.task}-${request.date || request.dates}`;

const getDocumentUrl = (request, requestType, options = {}) => {
  if (!request.id || !request.fileName) {
    return "";
  }

  return requestType === "leave"
    ? getLeaveRequestDocumentUrl(request.id, options)
    : getWfhRequestDocumentUrl(request.id, options);
};

function AdminRequestReview({ requesterRole = "employee", title = "Leave and WFH Requests", eyebrow = "Requests" }) {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [wfhRequests, setWfhRequests] = useState([]);
  const [decisionComments, setDecisionComments] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const searchQuery = usePortalSearchQuery("admin");

  const refreshRequests = useCallback(() =>
    Promise.all([getLeaveRequestsRemote(), getWfhRequestsRemote()])
      .then(([leaveData, wfhData]) => {
        setLeaveRequests(Array.isArray(leaveData) ? leaveData.filter((request) => isRoleRequest(request, requesterRole)) : []);
        setWfhRequests(Array.isArray(wfhData) ? wfhData.filter((request) => isRoleRequest(request, requesterRole)) : []);
      })
      .catch((error) => setStatusMessage(error.message || "Could not load requests.")), [requesterRole]);

  useEffect(() => {
    refreshRequests();

    const handleUpdate = () => {
      refreshRequests();
    };

    window.addEventListener("hr-leave-request-updated", handleUpdate);
    window.addEventListener("employee-wfh-request-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("hr-leave-request-updated", handleUpdate);
      window.removeEventListener("employee-wfh-request-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [refreshRequests]);

  const requests = [
    ...leaveRequests.map((request) => ({ ...request, requestType: "leave" })),
    ...wfhRequests.map((request) => ({ ...request, requestType: "wfh" })),
  ]
    .filter((request) => itemMatchesSearch(request, searchQuery))
    .sort((a, b) =>
      String(b.createdAt || b.requestDate || b.date || b.dates || "").localeCompare(
        String(a.createdAt || a.requestDate || a.date || a.dates || "")
      )
    );

  const updateDecision = async (request, status) => {
    if (!request.id) {
      return;
    }

    const currentUser = getCurrentUser();
    const key = getRequestKey(request);
    const details = {
      approverRole: "admin",
      decidedBy: currentUser.name || "Admin",
      decisionComment: decisionComments[key] || "",
    };

    setStatusMessage(`${status} request...`);

    try {
      if (request.requestType === "leave") {
        await decideLeaveRequestRemote(request.id, status, details);
      } else {
        await decideWfhRequestRemote(request.id, status, details);
      }

      setDecisionComments((current) => ({ ...current, [key]: "" }));
      setStatusMessage(`Request ${status.toLowerCase()} successfully.`);
      await refreshRequests();
      window.dispatchEvent(new CustomEvent("hr-leave-request-updated"));
      window.dispatchEvent(new CustomEvent("employee-wfh-request-updated"));
    } catch (error) {
      setStatusMessage(error.message || "Could not update request.");
    }
  };

  return (
    <article className="admin-panel wide-panel admin-request-review-panel">
      <div className="admin-panel-heading">
        <div><span>{eyebrow}</span><h2>{title}</h2></div>
        <FaCalendarCheck />
      </div>
      {statusMessage && <p className="admin-project-status">{statusMessage}</p>}
      <div className="admin-request-list">
        {requests.length ? requests.map((request) => {
          const key = getRequestKey(request);
          const isLeave = request.requestType === "leave";
          const documentUrl = getDocumentUrl(request, request.requestType);
          const downloadUrl = getDocumentUrl(request, request.requestType, { download: true });

          return (
            <section className="admin-request-card" key={`${request.requestType}-${key}`}>
              <header>
                <div>
                  <span>{isLeave ? "Leave Request" : "WFH Request"}</span>
                  <h3>{request.name}</h3>
                  <small>{request.email}</small>
                </div>
                {isLeave ? <FaCalendarCheck /> : <FaLaptopHouse />}
              </header>

              <div className="admin-request-meta">
                <p><strong>{isLeave ? request.type : request.task}</strong><span>{isLeave ? "Type" : "Project / Task"}</span></p>
                <p><strong>{isLeave ? request.dates : request.date}</strong><span>{isLeave ? "Dates" : "WFH Date"}</span></p>
                <p><strong>{request.status || "Pending"}</strong><span>Status</span></p>
                <p><strong>{request.requestDate || request.createdAt || "-"}</strong><span>Requested on</span></p>
              </div>

              <p className="admin-request-reason">{request.reason || "No reason added."}</p>

              {request.decisionDate && (
                <p className="admin-request-decision">
                  Decision: {request.status} on {request.decisionDate}
                  {request.decidedBy ? ` by ${request.decidedBy}` : ""}
                  {request.decisionComment ? ` - ${request.decisionComment}` : ""}
                </p>
              )}

              {request.fileName && (
                <div className="admin-request-file-actions">
                  <span>{request.fileName}</span>
                  {documentUrl && <a href={documentUrl} target="_blank" rel="noreferrer"><FaEye /> View</a>}
                  {downloadUrl && <a href={downloadUrl}><FaDownload /> Download</a>}
                </div>
              )}

              <label className="admin-request-comment">
                <span>Decision Comment</span>
                <textarea
                  value={decisionComments[key] || ""}
                  onChange={(event) => setDecisionComments((current) => ({ ...current, [key]: event.target.value }))}
                  placeholder="Optional approval or rejection comment"
                />
              </label>

              <div className="admin-request-actions">
                <button type="button" onClick={() => updateDecision(request, "Approved")}>Approve</button>
                <button className="danger" type="button" onClick={() => updateDecision(request, "Rejected")}>Reject</button>
              </div>
            </section>
          );
        }) : (
          <p className="admin-empty-state">No {requesterRole === "hr" ? "HR" : "employee"} Leave or WFH requests found.</p>
        )}
      </div>
    </article>
  );
}

export default AdminRequestReview;
