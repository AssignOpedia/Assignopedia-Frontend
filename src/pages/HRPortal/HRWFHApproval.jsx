import { useEffect, useState } from "react";
import { FaLaptopHouse } from "react-icons/fa";
import { decideWfhRequestRemote, getWfhRequestsRemote } from "../../utils/hrPortalApi";
import { addEmployeeDecisionNotification, formatNotificationDate } from "../../utils/requestNotifications";
import { itemMatchesSearch, useHrSearchQuery } from "../../utils/hrSearch";
import HRPortalLayout from "./HRPortalLayout";

const requests = [
  { name: "Nisha Roy", date: "Jun 18", task: "Content QA review", reason: "Home internet installation" },
  { name: "Rahul Das", date: "Jun 19", task: "Candidate screening", reason: "Medical appointment" },
  { name: "Sandipan Mondal", date: "Jun 20", task: "Technical content sprint", reason: "Focused documentation work" },
];

const wfhRequestStorageKey = "employeeWfhRequests";

const getStoredWfhRequests = () => {
  try {
    return JSON.parse(localStorage.getItem(wfhRequestStorageKey) || "[]");
  } catch {
    return [];
  }
};

const getRequestKey = (request) =>
  request.id || `${request.email || request.name}-${request.date}-${request.task}-${request.reason}`;

const toLocalRequest = (request) => {
  const localRequest = { ...request };

  delete localRequest.fileData;
  return localRequest;
};

const writeStoredWfhRequests = (requests) => {
  try {
    localStorage.setItem(wfhRequestStorageKey, JSON.stringify(requests.map(toLocalRequest)));
  } catch {
    localStorage.removeItem(wfhRequestStorageKey);
    localStorage.setItem(wfhRequestStorageKey, JSON.stringify(requests.slice(0, 10).map(toLocalRequest)));
  }
};

const createDocumentUrl = (data) => {
  if (!data || !data.startsWith("data:")) {
    return data;
  }

  const [metadata, base64Data] = data.split(",");
  if (!base64Data) {
    return data;
  }

  const mimeType = metadata.match(/^data:(.*);base64$/)?.[1] || "application/octet-stream";
  const byteCharacters = window.atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);

  for (let index = 0; index < byteCharacters.length; index += 1) {
    byteNumbers[index] = byteCharacters.charCodeAt(index);
  }

  return URL.createObjectURL(new Blob([new Uint8Array(byteNumbers)], { type: mimeType }));
};

function HRWFHApproval({ activePage, onNavigate }) {
  const [allRequests, setAllRequests] = useState(() => [...getStoredWfhRequests(), ...requests]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const searchQuery = useHrSearchQuery();
  const filteredRequests = allRequests.filter((request) => itemMatchesSearch(request, searchQuery));

  useEffect(() => {
    const refreshRequests = () => {
      setAllRequests([...getStoredWfhRequests(), ...requests]);
    };

    getWfhRequestsRemote()
      .then((remoteRequests) => {
        const customRequests = remoteRequests.filter((request) => !String(request.id || "").startsWith("default-"));

        writeStoredWfhRequests(customRequests);
        setAllRequests([...customRequests, ...requests]);
      })
      .catch(() => {});

    window.addEventListener("employee-wfh-request-updated", refreshRequests);
    window.addEventListener("storage", refreshRequests);

    return () => {
      window.removeEventListener("employee-wfh-request-updated", refreshRequests);
      window.removeEventListener("storage", refreshRequests);
    };
  }, []);

  const updateWfhStatus = async (request, status) => {
    const requestKey = getRequestKey(request);
    const decisionDate = formatNotificationDate();
    const storedRequests = getStoredWfhRequests();
    const updatedStoredRequests = storedRequests.map((storedRequest) =>
      getRequestKey(storedRequest) === requestKey
        ? { ...storedRequest, status, decisionDate }
        : storedRequest
    );

    writeStoredWfhRequests(updatedStoredRequests);
    window.dispatchEvent(new CustomEvent("employee-wfh-request-updated"));
    setAllRequests((current) =>
      current.map((currentRequest) =>
        getRequestKey(currentRequest) === requestKey
          ? { ...currentRequest, status, decisionDate }
          : currentRequest
      )
    );

    if (request.email) {
      addEmployeeDecisionNotification({
        type: "WFH",
        employeeEmail: request.email,
        status,
        decisionDate,
        detail: `${request.task} on ${request.date}`,
      });
    }

    if (request.id) {
      const response = await decideWfhRequestRemote(request.id, status).catch(() => null);

      if (response?.requests) {
        const customRequests = response.requests.filter((item) => !String(item.id || "").startsWith("default-"));
        writeStoredWfhRequests(customRequests);
        setAllRequests([...customRequests, ...requests]);
      }
    }
  };

  const handleViewDocument = (request) => {
    if (!request.fileData) {
      alert("No supporting file was uploaded for this WFH request.");
      return;
    }

    const documentUrl = createDocumentUrl(request.fileData);
    window.open(documentUrl, "_blank", "noopener,noreferrer");

    if (documentUrl.startsWith("blob:")) {
      window.setTimeout(() => URL.revokeObjectURL(documentUrl), 60000);
    }
  };

  const handleDownloadDocument = (request) => {
    if (!request.fileData) {
      alert("No supporting file was uploaded for this WFH request.");
      return;
    }

    const documentUrl = createDocumentUrl(request.fileData);
    const link = document.createElement("a");

    link.href = documentUrl;
    link.download = request.fileName || "wfh-supporting-file";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (documentUrl.startsWith("blob:")) {
      window.setTimeout(() => URL.revokeObjectURL(documentUrl), 1000);
    }
  };

  return (
    <HRPortalLayout activePage={activePage} eyebrow="WFH Approval" title="WFH Approval" onNavigate={onNavigate}>
      <section className="hr-page-card-grid">
        {filteredRequests.length > 0 ? filteredRequests.map((request, index) => (
          <article className="hr-panel hr-request-card" key={`${request.name}-${request.date}-${index}`}>
            <div className="hr-panel-heading"><div><span>{request.date}</span><h2>{request.name}</h2></div><FaLaptopHouse /></div>
            <p><strong>Project / Task:</strong> {request.task}</p>
            <p><strong>Reason:</strong> {request.reason}</p>
            <p><strong>Status:</strong> <span className={`hr-status ${(request.status || "Pending").toLowerCase()}`}>{request.status || "Pending"}</span></p>
            {request.requestDate && <p><strong>Requested on:</strong> {request.requestDate}</p>}
            {request.decisionDate && <p><strong>Decision date:</strong> {request.decisionDate}</p>}
            {request.fileName && <p><strong>File:</strong> {request.fileName}</p>}
            <div className="hr-action-pair">
              <button className="outline" type="button" onClick={() => setSelectedRequest(request)}>View Details</button>
              <button type="button" onClick={() => updateWfhStatus(request, "Approved")}>Approve</button>
              <button className="danger" type="button" onClick={() => updateWfhStatus(request, "Rejected")}>Reject</button>
            </div>
          </article>
        )) : (
          <article className="hr-panel"><p className="hr-empty-state">No WFH requests match the current search.</p></article>
        )}
      </section>

      {selectedRequest && (
        <div className="hr-modal-backdrop" role="presentation" onMouseDown={() => setSelectedRequest(null)}>
          <section
            className="hr-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wfh-details-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="hr-modal-close" type="button" onClick={() => setSelectedRequest(null)} aria-label="Close WFH details">
              &times;
            </button>
            <div className="hr-modal-heading">
              <span>WFH Details</span>
              <h2 id="wfh-details-title">{selectedRequest.name}</h2>
            </div>
            <div className="hr-detail-list">
              <p><strong>Employee name</strong><span>{selectedRequest.name}</span></p>
              <p><strong>Employee email</strong><span>{selectedRequest.email || "-"}</span></p>
              <p><strong>WFH date</strong><span>{selectedRequest.date}</span></p>
              <p><strong>Project / Task</strong><span>{selectedRequest.task}</span></p>
              <p><strong>Reason</strong><span>{selectedRequest.reason}</span></p>
              <p><strong>Status</strong><span>{selectedRequest.status || "Pending"}</span></p>
              <p><strong>Requested on</strong><span>{selectedRequest.requestDate || selectedRequest.createdAt || "-"}</span></p>
              <p>
                <strong>Supporting File</strong>
                <span>
                  {selectedRequest.fileName || "No file uploaded"}
                  {selectedRequest.fileName && (
                    <span className="hr-document-actions">
                      <button type="button" onClick={() => handleViewDocument(selectedRequest)}>View</button>
                      <button type="button" onClick={() => handleDownloadDocument(selectedRequest)}>Download</button>
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

export default HRWFHApproval;
