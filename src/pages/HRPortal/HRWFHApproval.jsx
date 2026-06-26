import { useEffect, useState } from "react";
import { FaLaptopHouse } from "react-icons/fa";
import {
  decideWfhRequestRemote,
  getWfhRequestDocumentUrl,
  getWfhRequestRemote,
  getWfhRequestsRemote,
  updateWfhRequestRemote,
} from "../../utils/hrPortalApi";
import { addEmployeeDecisionNotification, formatNotificationDate } from "../../utils/requestNotifications";
import { openDocumentPreview } from "../../utils/documentPreview";
import { itemMatchesSearch, useHrSearchQuery } from "../../utils/hrSearch";
import { uploadFileToCloudinary } from "../../utils/uploadApi";
import HRPortalLayout from "./HRPortalLayout";

const requests = [
  { name: "Nisha Roy", date: "Jun 18", task: "Content QA review", reason: "Home internet installation" },
  { name: "Rahul Das", date: "Jun 19", task: "Candidate screening", reason: "Medical appointment" },
  { name: "Sandipan Mondal", date: "Jun 20", task: "Technical content sprint", reason: "Focused documentation work" },
];

let cachedWfhRequests = [];

const getStoredWfhRequests = () => {
  return cachedWfhRequests;
};

const getRequestKey = (request) =>
  request.id || `${request.email || request.name}-${request.date}-${request.task}-${request.reason}`;

const toLocalRequest = (request) => {
  const localRequest = { ...request };

  delete localRequest.fileData;
  return localRequest;
};

const writeStoredWfhRequests = (requests) => {
  cachedWfhRequests = requests.map(toLocalRequest);
};

const getRequestDocument = (request) => ({
  data: request.fileData || "",
  url: request.fileUrl || (/^https?:\/\//i.test(request.fileData || "") ? request.fileData : ""),
  name: request.fileName || "",
  fileType: request.fileType || "",
});

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
  const [fileActionStatus, setFileActionStatus] = useState("");
  const [isRepairingFile, setIsRepairingFile] = useState(false);
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

  const getFullWfhRequest = async (request) => {
    if (!request.id) {
      return request;
    }

    const remoteRequest = await getWfhRequestRemote(request.id).catch(() => null);
    const fullRequest = remoteRequest || request;

    setAllRequests((current) =>
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
    const fullRequest = await getFullWfhRequest(request);
    setSelectedRequest(fullRequest);
  };

  const handleViewDocument = async (request) => {
    const previewWindow = window.open("", "_blank");

    if (previewWindow) {
      previewWindow.document.write("<p style=\"font-family:Arial,sans-serif;padding:24px;\">Loading WFH supporting file from MongoDB...</p>");
      previewWindow.document.close();
    }

    const fullRequest = await getFullWfhRequest(request);
    const fileDocument = getRequestDocument(fullRequest);
    let previewDocument = fileDocument;

    if (!previewDocument.data && !previewDocument.url && fullRequest.id && fullRequest.fileName) {
      setFileActionStatus("Finding WFH supporting file in Cloudinary...");
      const response = await fetch(getWfhRequestDocumentUrl(fullRequest.id, { meta: true }));

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));

        previewWindow?.close();
        setFileActionStatus(error.message || "Could not find this WFH supporting file in Cloudinary.");
        return;
      }

      previewDocument = await response.json();
    }

    if (!previewDocument.data && !previewDocument.url) {
      previewWindow?.close();
      setFileActionStatus("No supporting file was found for this WFH request.");
      return;
    }

    if (previewDocument.url) {
      openDocumentPreview({
        url: previewDocument.url,
        name: previewDocument.name || previewDocument.fileName,
        fileType: previewDocument.fileType,
        previewWindow,
      });
      setFileActionStatus("");
      return;
    }

    const documentUrl = createDocumentUrl(previewDocument.data);

    if (previewWindow) {
      previewWindow.location.href = documentUrl;
      previewWindow.document.title = previewDocument.name || previewDocument.fileName || "WFH supporting file";
    } else {
      window.open(documentUrl, "_blank", "noopener,noreferrer");
    }

    if (documentUrl.startsWith("blob:")) {
      window.setTimeout(() => URL.revokeObjectURL(documentUrl), 60000);
    }

    setFileActionStatus("");
  };

  const handleDownloadDocument = async (request) => {
    const fullRequest = await getFullWfhRequest(request);
    const fileDocument = getRequestDocument(fullRequest);
    let downloadDocument = fileDocument;

    if (!downloadDocument.data && !downloadDocument.url && fullRequest.id && fullRequest.fileName) {
      setFileActionStatus("Finding WFH supporting file in Cloudinary...");
      const response = await fetch(getWfhRequestDocumentUrl(fullRequest.id, { meta: true }));

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));

        setFileActionStatus(error.message || "Could not find this WFH supporting file in Cloudinary.");
        return;
      }

      downloadDocument = await response.json();
    }

    if (!downloadDocument.data && !downloadDocument.url) {
      setFileActionStatus("No supporting file was found for this WFH request.");
      return;
    }

    if (downloadDocument.url) {
      const link = document.createElement("a");

      link.href = downloadDocument.url;
      link.download = downloadDocument.name || downloadDocument.fileName || "wfh-supporting-file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setFileActionStatus("");
      return;
    }

    const documentUrl = createDocumentUrl(downloadDocument.data);
    const link = document.createElement("a");

    link.href = documentUrl;
    link.download = downloadDocument.name || downloadDocument.fileName || "wfh-supporting-file";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (documentUrl.startsWith("blob:")) {
      window.setTimeout(() => URL.revokeObjectURL(documentUrl), 1000);
    }

    setFileActionStatus("");
  };

  const handleRepairFile = async (event, request) => {
    const file = event.target.files?.[0];

    if (!file || !request.id) {
      return;
    }

    setIsRepairingFile(true);
    setFileActionStatus("Uploading WFH supporting file to Cloudinary...");

    try {
      const upload = await uploadFileToCloudinary(file, {
        folder: "assignopedia/wfh-requests",
        resourceType: "auto",
      });
      const repairedRequest = {
        ...request,
        fileName: file.name,
        fileData: upload.url,
        fileUrl: upload.url,
        filePublicId: upload.publicId,
        fileResourceType: upload.resourceType,
        fileType: file.type || upload.fileType || "application/octet-stream",
        fileSize: upload.bytes || file.size,
      };
      const response = await updateWfhRequestRemote(request.id, repairedRequest);
      const savedRequest = response.item || repairedRequest;

      setAllRequests((current) =>
        current.map((currentRequest) =>
          getRequestKey(currentRequest) === getRequestKey(savedRequest) ? savedRequest : currentRequest
        )
      );
      writeStoredWfhRequests(
        getStoredWfhRequests().map((storedRequest) =>
          getRequestKey(storedRequest) === getRequestKey(savedRequest) ? savedRequest : storedRequest
        )
      );
      setSelectedRequest(savedRequest);
      setFileActionStatus("Supporting file saved. You can view or download it now.");
    } catch (error) {
      setFileActionStatus(error.message || "Could not save the WFH supporting file.");
    } finally {
      setIsRepairingFile(false);
      event.target.value = "";
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
              <button className="outline" type="button" onClick={() => handleSelectRequest(request)}>View Details</button>
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
                  {selectedRequest.id && (
                    <label className="hr-document-repair">
                      <span>{selectedRequest.fileName ? "Replace missing file" : "Upload file"}</span>
                      <input
                        type="file"
                        onChange={(event) => handleRepairFile(event, selectedRequest)}
                        disabled={isRepairingFile}
                      />
                    </label>
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

export default HRWFHApproval;
