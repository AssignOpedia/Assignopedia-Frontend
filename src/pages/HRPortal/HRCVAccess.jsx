import { FaDownload, FaEye, FaFileAlt } from "react-icons/fa";
import HRPortalLayout from "./HRPortalLayout";

const cvs = [
  { name: "Priya Nair", role: "Research Writer", uploaded: "Jun 12" },
  { name: "Arjun Mehta", role: "Frontend Developer", uploaded: "Jun 14" },
  { name: "Rahul Das", role: "HR Associate", uploaded: "Jun 15" },
];

function HRCVAccess({ activePage, onNavigate }) {
  return (
    <HRPortalLayout activePage={activePage} eyebrow="CV Access" title="CV Access" onNavigate={onNavigate}>
      <article className="hr-panel">
        <div className="hr-panel-heading"><div><span>Candidate Files</span><h2>Candidate CV List</h2></div><FaFileAlt /></div>
        <div className="hr-file-list">
          {cvs.map((cv) => (
            <div className="hr-file-row" key={cv.name}>
              <div><strong>{cv.name}</strong><small>{cv.role} - Uploaded {cv.uploaded}</small></div>
              <div className="hr-action-pair"><button><FaEye /> View</button><button><FaDownload /> Download</button></div>
            </div>
          ))}
        </div>
      </article>
    </HRPortalLayout>
  );
}

export default HRCVAccess;
