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
  getCVApplicationsRemote,
  updateCVApplicationRemote,
} from "../../utils/cvApi";
import { itemMatchesSearch, useHrSearchQuery } from "../../utils/hrSearch";
import HRPortalLayout from "./HRPortalLayout";

const createCVObjectUrl = (cv) => {
  if (!cv?.cvData) {
    return "";
  }

  if (!cv.cvData.startsWith("data:")) {
    return cv.cvData;
  }

  const [metadata, base64Data] = cv.cvData.split(",");
  if (!base64Data) {
    return cv.cvData;
  }

  const mimeType = metadata.match(/^data:(.*);base64$/)?.[1] || "application/pdf";
  const byteCharacters = window.atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);

  for (let index = 0; index < byteCharacters.length; index += 1) {
    byteNumbers[index] = byteCharacters.charCodeAt(index);
  }

  const blob = new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
  return URL.createObjectURL(blob);
};

function CVPreviewFrame({ cv }) {
  const previewUrl = useMemo(() => createCVObjectUrl(cv), [cv]);

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

  return <iframe src={previewUrl} title={cv.cvFileName || "Candidate CV"} />;
}

function HRCVAccess({ activePage, onNavigate }) {
  const [cvs, setCvs] = useState(() => getStoredCVs());
  const [selectedCV, setSelectedCV] = useState(null);
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
    if (!cv.cvData) {
      return;
    }

    const cvUrl = createCVObjectUrl(cv);
    const link = document.createElement("a");
    link.href = cvUrl;
    link.download = cv.cvFileName || `${cv.fullName}-CV.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (cvUrl.startsWith("blob:")) {
      window.setTimeout(() => URL.revokeObjectURL(cvUrl), 1000);
    }
  };

  const handleOpenCV = (cv) => {
    if (!cv.cvData) {
      return;
    }

    const cvUrl = createCVObjectUrl(cv);
    const title = cv.cvFileName || "Candidate CV";
    const previewWindow = window.open(cvUrl, "_blank", "noopener,noreferrer");
    if (previewWindow) {
      previewWindow.document.title = title;
    }

    if (cvUrl.startsWith("blob:")) {
      window.setTimeout(() => URL.revokeObjectURL(cvUrl), 60000);
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
              <p><strong>File</strong><span>{selectedCV.cvFileName || "CV attached"}</span></p>
              <p><strong>Status</strong><span className={`hr-status ${(selectedCV.status || "new").toLowerCase()}`}>{selectedCV.status || "New"}</span></p>
            </div>

            <div className="hr-cv-about">
              <strong>Candidate note</strong>
              <p>{selectedCV.about}</p>
            </div>

            <div className="hr-cv-preview">
              {selectedCV.cvData ? (
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
