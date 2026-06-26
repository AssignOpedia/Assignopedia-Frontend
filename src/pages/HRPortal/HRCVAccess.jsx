import { useEffect, useMemo, useState } from "react";
import { FaDownload, FaEye, FaFileAlt, FaSearch, FaTrash } from "react-icons/fa";
import {
  deleteCVApplication,
  getCVEvent,
  getStoredCVs,
  setStoredCVs,
  updateCVApplicationStatus,
} from "../../utils/cvStorage";
import {
  deleteCVApplicationRemote,
  getCVApplicationDocumentUrl,
  getCVApplicationsRemote,
  updateCVApplicationRemote,
} from "../../utils/cvApi";
import { itemMatchesSearch, useHrSearchQuery } from "../../utils/hrSearch";
import { readFileAsDataUrl, uploadFileToCloudinary } from "../../utils/uploadApi";
import HRPortalLayout from "./HRPortalLayout";

const getCVDocument = (cv) => ({
  data: cv?.cvInlineData || (/^data:/i.test(cv?.cvData || "") ? cv.cvData : ""),
  url: cv?.cvUrl || (/^https?:\/\//i.test(cv?.cvData || "") ? cv.cvData : "") || (cv?.id ? getCVApplicationDocumentUrl(cv.id) : ""),
  name: cv?.cvFileName || `${cv?.fullName || "candidate"}-CV.pdf`,
  fileType: cv?.cvFileType || "application/pdf",
});

const isPdfUrl = (url = "") => /\.pdf($|[?#])/i.test(url);

const getCloudinaryAttachmentUrl = (url = "", fileName = "candidate-cv.pdf") => {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }

  const cleanFileName = fileName.replace(/[^a-z0-9._-]+/gi, "_").replace(/^_+|_+$/g, "") || "candidate-cv.pdf";

  return url.replace("/upload/", `/upload/fl_attachment:${encodeURIComponent(cleanFileName)}/`);
};

const getPreviewUrl = (document) => document.url || "";

const getDownloadUrl = (cv) => {
  const document = getCVDocument(cv);
  const url = getCloudinaryAttachmentUrl(document.url, document.name);

  if (!url && cv?.id) {
    return getCVApplicationDocumentUrl(cv.id, { download: true });
  }

  return url;
};

const createCVObjectUrl = (cv) => {
  const document = getCVDocument(cv);

  if (document.data) {
    if (!document.data.startsWith("data:")) {
      return document.data;
    }

    const [metadata, base64Data] = document.data.split(",");
    if (!base64Data) {
      return document.data;
    }

    const mimeType = metadata.match(/^data:(.*);base64$/)?.[1] || "application/pdf";
    const byteCharacters = window.atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let index = 0; index < byteCharacters.length; index += 1) {
      byteNumbers[index] = byteCharacters.charCodeAt(index);
    }

    const blob = new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
    return URL.createObjectURL(blob);
  }

  if (document.url) {
    return getPreviewUrl(document);
  }

  return "";
};

function CVPreviewFrame({ cv }) {
  const previewUrl = useMemo(() => createCVObjectUrl(cv), [cv]);
  const fallbackUrl = cv?.id ? getCVApplicationDocumentUrl(cv.id) : "";

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!previewUrl) {
    return <p>No CV file data available.</p>;
  }

  return (
    <object data={previewUrl} type="application/pdf" title={cv.cvFileName || "Candidate CV"}>
      {fallbackUrl ? (
        <iframe src={fallbackUrl} title={cv.cvFileName || "Candidate CV"} />
      ) : (
        <p>No CV preview available.</p>
      )}
    </object>
  );
}

function HRCVAccess({ activePage, onNavigate }) {
  const [cvs, setCvs] = useState(() => getStoredCVs());
  const [selectedCV, setSelectedCV] = useState(null);
  const [fileActionStatus, setFileActionStatus] = useState("");
  const [isRepairingCV, setIsRepairingCV] = useState(false);
  const searchQuery = useHrSearchQuery();
  const filteredCVs = cvs.filter((cv) => itemMatchesSearch(cv, searchQuery));

  useEffect(() => {
    const refreshCVs = () => {
      setCvs(getStoredCVs());
    };

    getCVApplicationsRemote()
      .then((remoteCVs) => {
        setStoredCVs(remoteCVs);
        setCvs(remoteCVs);
      })
      .catch(() => {});

    const event = getCVEvent();
    window.addEventListener(event, refreshCVs);
    window.addEventListener("storage", refreshCVs);

    return () => {
      window.removeEventListener(event, refreshCVs);
      window.removeEventListener("storage", refreshCVs);
    };
  }, []);

  const handleDownloadCV = (cv) => {
    const fileDocument = getCVDocument(cv);

    if (!fileDocument.data && !fileDocument.url) {
      return;
    }

    const cvUrl = fileDocument.data ? createCVObjectUrl(cv) : getDownloadUrl(cv) || createCVObjectUrl(cv);
    const link = document.createElement("a");
    link.href = cvUrl;
    link.download = fileDocument.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (cvUrl.startsWith("blob:")) {
      window.setTimeout(() => URL.revokeObjectURL(cvUrl), 1000);
    }
  };

  const handleOpenCV = (cv) => {
    const fileDocument = getCVDocument(cv);

    if (!fileDocument.data && !fileDocument.url) {
      return;
    }

    window.open(createCVObjectUrl(cv) || getPreviewUrl(fileDocument) || getCVApplicationDocumentUrl(cv.id), "_blank", "noopener,noreferrer");
  };

  const handleRepairCV = async (event, cv) => {
    const file = event.target.files?.[0];

    if (!file || !cv?.id) {
      return;
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setFileActionStatus("Please upload a PDF file.");
      event.target.value = "";
      return;
    }

    setIsRepairingCV(true);
    setFileActionStatus("Uploading CV to Cloudinary...");

    try {
      const cvInlineData = await readFileAsDataUrl(file);
      const upload = await uploadFileToCloudinary(file, {
        folder: "assignopedia/cv-applications",
        resourceType: "raw",
      });
      const repairedCV = {
        ...cv,
        cvFileName: file.name,
        cvData: upload.url,
        cvInlineData,
        cvUrl: upload.url,
        cvPublicId: upload.publicId,
        cvResourceType: upload.resourceType,
        cvFileType: file.type || upload.fileType || "application/pdf",
      };
      const response = await updateCVApplicationRemote(repairedCV);
      const savedCV = response.item || repairedCV;
      const nextCVs = cvs.map((item) => (item.id === savedCV.id ? savedCV : item));

      setStoredCVs(nextCVs);
      setCvs(nextCVs);
      setSelectedCV(savedCV);
      setFileActionStatus("CV saved. You can open or download it now.");
    } catch (error) {
      setFileActionStatus(error.message || "Could not save the CV file.");
    } finally {
      setIsRepairingCV(false);
      event.target.value = "";
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this CV application?")) {
      deleteCVApplication(id);
      await deleteCVApplicationRemote(id).catch(() => {});
      setCvs(getStoredCVs());
      setSelectedCV(null);
    }
  };

  const handleStatusChange = async (cv, status) => {
    const updatedCV = updateCVApplicationStatus(cv.id, status);

    if (updatedCV) {
      await updateCVApplicationRemote(updatedCV).catch(() => {});
    }

    setCvs(getStoredCVs());
    setSelectedCV(updatedCV);
  };

  return (
    <HRPortalLayout activePage={activePage} eyebrow="CV Access" title="CV Access" onNavigate={onNavigate}>
      {selectedCV ? (
        <article className="hr-panel">
          <div className="hr-panel-heading">
            <div>
              <span>Application Details</span>
              <h2>{selectedCV.fullName}</h2>
            </div>
            <button className="hr-close-button" type="button" onClick={() => setSelectedCV(null)}>
              Close
            </button>
          </div>

          <div className="hr-cv-detail-grid">
            <div className="hr-detail-list">
              <p><strong>Position</strong><span>{selectedCV.position}</span></p>
              <p><strong>Email</strong><span><a href={`mailto:${selectedCV.email}`}>{selectedCV.email}</a></span></p>
              <p><strong>Phone</strong><span><a href={`tel:${selectedCV.phone}`}>{selectedCV.phone}</a></span></p>
              <p><strong>Submitted</strong><span>{selectedCV.date}</span></p>
              <p>
                <strong>File</strong>
                <span>
                  {selectedCV.cvFileName || "CV attached"}
                  <label className="hr-document-repair">
                    <span>Replace CV</span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(event) => handleRepairCV(event, selectedCV)}
                      disabled={isRepairingCV}
                    />
                  </label>
                  {fileActionStatus && <small className="hr-document-status">{fileActionStatus}</small>}
                </span>
              </p>
              <p><strong>Status</strong><span className={`hr-status ${(selectedCV.status || "new").toLowerCase()}`}>{selectedCV.status || "New"}</span></p>
            </div>

            <div className="hr-cv-about">
              <strong>Candidate note</strong>
              <p>{selectedCV.about}</p>
            </div>

            <div className="hr-cv-preview">
              {getCVDocument(selectedCV).data || getCVDocument(selectedCV).url ? (
                <CVPreviewFrame cv={selectedCV} />
              ) : (
                <p>No CV file data available.</p>
              )}
            </div>

            <div className="hr-action-pair">
              <button type="button" onClick={() => handleOpenCV(selectedCV)}><FaEye /> Open CV</button>
              <button type="button" onClick={() => handleDownloadCV(selectedCV)}><FaDownload /> Download CV</button>
              {["Reviewed", "Shortlisted", "Rejected"].map((status) => (
                <button
                  className={status === "Rejected" ? "danger" : "outline"}
                  type="button"
                  key={status}
                  onClick={() => handleStatusChange(selectedCV, status)}
                >
                  Mark {status}
                </button>
              ))}
            </div>
          </div>
        </article>
      ) : (
        <article className="hr-panel">
          <div className="hr-panel-heading">
            <div>
              <span>Candidate Files</span>
              <h2>Candidate CV List ({filteredCVs.length})</h2>
              {searchQuery && <small><FaSearch /> Filtered by "{searchQuery}"</small>}
            </div>
            <FaFileAlt />
          </div>

          <div className="hr-file-list">
            {filteredCVs.length > 0 ? (
              filteredCVs.map((cv) => (
                <div className="hr-file-row" key={cv.id}>
                  <div>
                    <strong>{cv.fullName}</strong>
                    <small>{cv.position} - Uploaded {cv.date} - {cv.status || "New"}</small>
                  </div>
                  <div className="hr-action-pair">
                    <button type="button" onClick={() => setSelectedCV(cv)}><FaEye /> View</button>
                    <button type="button" onClick={() => handleDownloadCV(cv)}><FaDownload /> Download</button>
                    <button className="danger" type="button" onClick={() => handleDelete(cv.id)}><FaTrash /> Delete</button>
                  </div>
                </div>
              ))
            ) : (
              <p className="hr-empty-state">
                {cvs.length === 0
                  ? "No CV applications submitted yet. Candidates will see their applications here after applying through the Careers page."
                  : "No CV applications match the current search."}
              </p>
            )}
          </div>
        </article>
      )}
    </HRPortalLayout>
  );
}

export default HRCVAccess;
