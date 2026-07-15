import { useEffect, useState } from "react";
import { FaChartLine, FaClipboardCheck, FaDownload, FaFileAlt, FaProjectDiagram } from "react-icons/fa";
import { downloadAttendanceCsv } from "../../utils/attendanceStorage";
import { getPortalResource } from "../../utils/portalDataApi";
import AdminPortalLayout from "./AdminPortalLayout";

const fallbackReports = [
  { title: "Today's Attendance Reports", detail: "Daily login, logout, role, status, and late-login summary", type: "attendance", updated: "Today" },
  { title: "Employee Performance Reports", detail: "Score trends, rankings, quality, and productivity", type: "performance", updated: "2 hours ago" },
  { title: "Project Reports", detail: "Milestones, delays, ownership, and deadline movement", type: "projects", updated: "Yesterday" },
];

const reportIcons = {
  attendance: <FaClipboardCheck />,
  performance: <FaChartLine />,
  projects: <FaProjectDiagram />,
};

function AdminReports({ activePage, onNavigate }) {
  const [reports, setReports] = useState(fallbackReports);

  useEffect(() => {
    getPortalResource("reports", fallbackReports).then((data) => {
      const nextReports = Array.isArray(data) && data.length ? data : fallbackReports;

      setReports(nextReports.filter((report) => report.type !== "revenue" && report.title !== "Revenue Reports"));
    });
  }, []);

  return (
    <AdminPortalLayout
      activePage={activePage}
      eyebrow="Business intelligence"
      title="Reports"
      description="Generate and download attendance, employee, and project reports for admin review."
      onNavigate={onNavigate}
      action={<button type="button"><FaFileAlt /> Schedule Report</button>}
    >
      <section className="admin-content-grid admin-reports-grid">
        {reports.map((report) => (
          <article className="admin-panel report-card" key={report.title}>
            <div className="report-icon">{reportIcons[report.type] || <FaFileAlt />}</div>
            <span>{report.updated}</span>
            <h2>{report.type === "attendance" ? "Today's Attendance Reports" : report.title}</h2>
            <p>{report.detail}</p>
            <button type="button" onClick={report.type === "attendance" ? downloadAttendanceCsv : undefined}><FaDownload /> Download</button>
          </article>
        ))}
      </section>
    </AdminPortalLayout>
  );
}

export default AdminReports;
