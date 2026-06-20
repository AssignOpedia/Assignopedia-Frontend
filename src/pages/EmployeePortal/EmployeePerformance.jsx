import { FaAward, FaChartLine, FaStar } from "react-icons/fa";
import { getEmployeeDashboardMetrics } from "../../utils/employeeDashboardMetrics";
import EmployeePortalLayout from "./EmployeePortalLayout";

function EmployeePerformance({ activePage, onNavigate }) {
  const { performance, workReport } = getEmployeeDashboardMetrics();

  return (
    <EmployeePortalLayout activePage={activePage} eyebrow="Performance" title="Performance Score" onNavigate={onNavigate}>
      <section className="dashboard-grid">
        <article className="portal-card performance-card">
          <div className="card-heading"><div><span>Current Score</span><h3>Monthly Rating</h3></div><FaAward /></div>
          <div
            className="score-orbit"
            style={{
              background: `radial-gradient(circle closest-side,#fff 69%,transparent 71%), conic-gradient(var(--portal-blue) ${performance.score}%,rgba(11,34,85,.12) 0)`,
            }}
          >
            <strong>{performance.score}</strong><span>{performance.label}</span>
          </div>
          <p>Score updates from attendance, punctuality, work progress, and leave/WFH activity.</p>
        </article>
        <article className="portal-card">
          <div className="card-heading"><div><span>Metrics</span><h3>Performance Drivers</h3></div><FaChartLine /></div>
          <div className="timeline-list">
            <p><strong>Punctuality</strong><span>{performance.punctualityScore}%</span></p>
            <p><strong>Attendance</strong><span>{performance.attendanceScore}%</span></p>
            <p><strong>Work Progress</strong><span>{performance.workScore}%</span></p>
            <p><strong>Collaboration</strong><span>{performance.collaborationScore}%</span></p>
          </div>
        </article>
      </section>

      <section className="portal-card">
        <div className="card-heading"><div><span>Highlights</span><h3>Recent Achievements</h3></div><FaStar /></div>
        <div className="announcement-list">
          <p>Completed {workReport.monthlyWorkHours}h of work this month.</p>
          <p>Recorded {workReport.presentDays} present days in the current month.</p>
          <p>Kept late logins to {workReport.lateLoginCount} day(s).</p>
        </div>
      </section>
    </EmployeePortalLayout>
  );
}

export default EmployeePerformance;
