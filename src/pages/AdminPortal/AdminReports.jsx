import { FaChartLine, FaClipboardCheck, FaDownload, FaFileAlt, FaProjectDiagram, FaWallet } from "react-icons/fa";
import { downloadAttendanceCsv } from "../../utils/attendanceStorage";
import AdminPortalLayout from "./AdminPortalLayout";

const reports = [
  { title: "Attendance Reports", detail: "Daily presence, leave, and remote work summaries", icon: <FaClipboardCheck />, updated: "Today", onDownload: downloadAttendanceCsv },
  { title: "Employee Performance Reports", detail: "Score trends, rankings, quality, and productivity", icon: <FaChartLine />, updated: "2 hours ago" },
  { title: "Project Reports", detail: "Milestones, delays, ownership, and deadline movement", icon: <FaProjectDiagram />, updated: "Yesterday" },
  { title: "Revenue Reports", detail: "Monthly revenue, team contribution, and billing codes", icon: <FaWallet />, updated: "Today" },
];

function AdminReports({ activePage, onNavigate }) {
  return (
    <AdminPortalLayout
      activePage={activePage}
      eyebrow="Business intelligence"
      title="Reports"
      description="Generate and download attendance, employee, project, and revenue reports for admin review."
      onNavigate={onNavigate}
      action={<button type="button"><FaFileAlt /> Schedule Report</button>}
    >
      <section className="admin-content-grid">
        {reports.map((report) => (
          <article className="admin-panel report-card" key={report.title}>
            <div className="report-icon">{report.icon}</div>
            <span>{report.updated}</span>
            <h2>{report.title}</h2>
            <p>{report.detail}</p>
            <button type="button" onClick={report.onDownload}><FaDownload /> Download</button>
          </article>
        ))}
      </section>
    </AdminPortalLayout>
  );
}

export default AdminReports;
