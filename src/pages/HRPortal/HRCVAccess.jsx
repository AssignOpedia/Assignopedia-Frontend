import { useEffect, useState } from "react";
import { FaDownload, FaEye, FaFileAlt, FaSearch, FaTrash } from "react-icons/fa";
import {
  deleteCVApplication,
  getCVEvent,
  getStoredCVs,
  updateCVApplicationStatus,
} from "../../utils/cvStorage";
import { itemMatchesSearch, useHrSearchQuery } from "../../utils/hrSearch";
import HRPortalLayout from "./HRPortalLayout";

function HRCVAccess({ activePage, onNavigate }) {
  const [cvs, setCvs] = useState(() => getStoredCVs());
  const [selectedCV, setSelectedCV] = useState(null);
  const searchQuery = useHrSearchQuery();
  const filteredCVs = cvs.filter((cv) => itemMatchesSearch(cv, searchQuery));

  useEffect(() => {
    const refreshCVs = () => {
      setCvs(getStoredCVs());
    };

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

    const link = document.createElement("a");
    link.href = cv.cvData;
    link.download = cv.cvFileName || `${cv.fullName}-CV.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenCV = (cv) => {
    if (!cv.cvData) {
      return;
    }

    const previewWindow = window.open();
    if (previewWindow) {
      previewWindow.document.write(
        `<iframe src="${cv.cvData}" title="${cv.cvFileName || "Candidate CV"}" style="border:0;width:100%;height:100vh;"></iframe>`
      );
      previewWindow.document.close();
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this CV application?")) {
      deleteCVApplication(id);
      setCvs(getStoredCVs());
      setSelectedCV(null);
    }
  };

  const handleStatusChange = (cv, status) => {
    const updatedCV = updateCVApplicationStatus(cv.id, status);
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
                <iframe src={selectedCV.cvData} title={selectedCV.cvFileName || "Candidate CV"} />
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
