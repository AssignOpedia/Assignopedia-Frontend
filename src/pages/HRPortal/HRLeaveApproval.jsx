import { useEffect, useState } from "react";
import { FaCalendarCheck } from "react-icons/fa";
import {
  decideLeaveRequestRemote,
  getLeaveRequestDocumentUrl,
  getLeaveRequestRemote,
  getLeaveRequestsRemote,
} from "../../utils/hrPortalApi";
import { addEmployeeDecisionNotification, formatNotificationDate } from "../../utils/requestNotifications";
import { openDocumentPreview } from "../../utils/documentPreview";
import { itemMatchesSearch, useHrSearchQuery } from "../../utils/hrSearch";
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

let cachedLeaveRequests = [];

const getStoredLeaveRequests = () => {
  return cachedLeaveRequests;
};

const getRequestKey = (request) =>
  request.id || `${request.email || request.name}-${request.type}-${request.dates}-${request.reason}`;

const toLocalRequest = (request) => {
  const localRequest = { ...request };

  delete localRequest.fileData;
  delete localRequest.pdfData;
  return localRequest;
};

const writeStoredLeaveRequests = (requests) => {
  cachedLeaveRequests = requests.map(toLocalRequest);
};

const getRequestDocument = (request) => ({
  data: request.fileData || request.pdfData || "",
  url: request.fileUrl || request.pdfUrl || (/^https?:\/\//i.test(request.fileData || request.pdfData || "") ? request.fileData || request.pdfData : ""),
  name: request.fileName || request.pdfFileName || "",
  fileType: request.fileType || "",
});

function HRLeaveApproval({ activePage, onNavigate }) {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [allLeaveRequests, setAllLeaveRequests] = useState(() => [...getStoredLeaveRequests(), ...leaveRequests]);
  const [fileActionStatus, setFileActionStatus] = useState("");
  const searchQuery = useHrSearchQuery();
  const filteredLeaveRequests = allLeaveRequests.filter((request) =>
    itemMatchesSearch(request, searchQuery)
  );

  useEffect(() => {
    const refreshLeaveRequests = () => {
      setAllLeaveRequests([...getStoredLeaveRequests(), ...leaveRequests]);
    };

    getLeaveRequestsRemote()
      .then((remoteRequests) => {
        const customRequests = remoteRequests.filter((request) => !String(request.id || "").startsWith("default-"));

        writeStoredLeaveRequests(customRequests);
        setAllLeaveRequests([...customRequests, ...leaveRequests]);
      })
      .catch(() => {});

    window.addEventListener("hr-leave-request-updated", refreshLeaveRequests);
    window.addEventListener("storage", refreshLeaveRequests);

    return () => {
      window.removeEventListener("hr-leave-request-updated", refreshLeaveRequests);
      window.removeEventListener("storage", refreshLeaveRequests);
    };
  }, []);

  const updateStoredLeaveStatus = async (request, status) => {
    const requestKey = getRequestKey(request);
    const decisionDate = formatNotificationDate();
    const storedRequests = getStoredLeaveRequests();
    const updatedStoredRequests = storedRequests.map((storedRequest) =>
      getRequestKey(storedRequest) === requestKey
        ? { ...storedRequest, status, decisionDate }
        : storedRequest
    );

    writeStoredLeaveRequests(updatedStoredRequests);
    window.dispatchEvent(new CustomEvent("hr-leave-request-updated"));
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

    if (request.id) {
      const response = await decideLeaveRequestRemote(request.id, status).catch(() => null);

      if (response?.requests) {
        const customRequests = response.requests.filter((item) => !String(item.id || "").startsWith("default-"));
        writeStoredLeaveRequests(customRequests);
        setAllLeaveRequests([...customRequests, ...leaveRequests]);
      }
    }
  };

  const getFullLeaveRequest = async (request) => {
    if (!request.id) {
      return request;
    }

    const remoteRequest = await getLeaveRequestRemote(request.id).catch(() => null);
    const fullRequest = remoteRequest || request;

    setAllLeaveRequests((current) =>
      current.map((currentRequest) =>
        getRequestKey(currentRequest) === getRequestKey(fullRequest) ? fullRequest : currentRequest
      )
    );
    setSelectedRequest((current) =>
      current && getRequestKey(current) === getRequestKey(fullRequest) ? fullRequest : current
    );

    return fullRequest;
  };

  const handleSelectRequest = async (request) => {
    setFileActionStatus("");
    setSelectedRequest(request);
    const fullRequest = await getFullLeaveRequest(request);
    setSelectedRequest(fullRequest);
  };

  const fetchLeaveDocument = async (request, { download = false } = {}) => {
    const document = getRequestDocument(request);

    if (!request.id || !document.name) {
      throw new Error("No stored file was found for this leave request.");
    }

    const response = await fetch(getLeaveRequestDocumentUrl(request.id, { download }));

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Could not fetch the leave document from MongoDB.");
    }

    return {
      blob: await response.blob(),
      name: document.name || "leave-document",
    };
  };

  const handleViewDocument = async (request) => {
    const previewWindow = window.open("", "_blank");

    if (previewWindow) {
      previewWindow.document.write("<p style=\"font-family:Arial,sans-serif;padding:24px;\">Loading leave document from MongoDB...</p>");
      previewWindow.document.close();
    }

    try {
      setFileActionStatus("Opening file from MongoDB...");
      const document = getRequestDocument(request);

      if (document.url) {
        openDocumentPreview({
          url: document.url,
          name: document.name,
          fileType: document.fileType,
          previewWindow,
        });
        setFileActionStatus("");
        return;
      }

      const { blob, name } = await fetchLeaveDocument(request);
      const url = URL.createObjectURL(blob);

      if (previewWindow) {
        previewWindow.location.href = url;
        previewWindow.document.title = name;
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }

      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
      setFileActionStatus("");
    } catch (error) {
      previewWindow?.close();
      setFileActionStatus(error.message);
    }
  };

  const handleDownloadDocument = async (request) => {
    try {
      setFileActionStatus("Downloading file from MongoDB...");
      const { blob, name } = await fetchLeaveDocument(request, { download: true });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setFileActionStatus("");
    } catch (error) {
      setFileActionStatus(error.message);
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
              {filteredLeaveRequests.length > 0 ? filteredLeaveRequests.map((request, index) => (
                <tr key={`${request.name}-${request.dates}-${index}`}>
                  <td>{request.name}</td><td>{request.type}</td><td>{request.dates}</td><td>{request.days}</td>
                  <td><span className={`hr-status ${request.status.toLowerCase()}`}>{request.status}</span></td>
                  <td>
                    <div className="hr-action-pair">
                      <button className="outline" type="button" onClick={() => handleSelectRequest(request)}>View</button>
                      <button type="button" onClick={() => updateStoredLeaveStatus(request, "Approved")}>Approve</button>
                      <button className="danger" type="button" onClick={() => updateStoredLeaveStatus(request, "Rejected")}>Reject</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6">No leave requests match the current search.</td>
                </tr>
              )}
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
              <p><strong>Employee email</strong><span>{selectedRequest.email || "-"}</span></p>
              <p><strong>Requested on</strong><span>{selectedRequest.requestDate || selectedRequest.createdAt || "-"}</span></p>
              <p>
                <strong>Supporting Document</strong>
                <span>
                  {getRequestDocument(selectedRequest).name || "No document uploaded"}
                  {selectedRequest.id && getRequestDocument(selectedRequest).name && (
                    <span className="hr-document-actions">
                      <button type="button" onClick={() => handleViewDocument(selectedRequest)}>
                        View File
                      </button>
                      <button type="button" onClick={() => handleDownloadDocument(selectedRequest)}>
                        Download File
                      </button>
                    </span>
                  )}
                  {fileActionStatus && <small className="hr-document-status">{fileActionStatus}</small>}
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
