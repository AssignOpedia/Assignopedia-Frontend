import { FaAward, FaChartLine, FaStar } from "react-icons/fa";
import EmployeePortalLayout from "./EmployeePortalLayout";

function EmployeePerformance({ activePage, onNavigate }) {
  return (
    <EmployeePortalLayout activePage={activePage} eyebrow="Performance" title="Performance Score" onNavigate={onNavigate}>
      <section className="dashboard-grid">
        <article className="portal-card performance-card">
          <div className="card-heading"><div><span>Current Score</span><h3>Monthly Rating</h3></div><FaAward /></div>
          <div className="score-orbit"><strong>92</strong><span>Excellent</span></div>
          <p>Quality, punctuality, collaboration, and task completion remain above target.</p>
        </article>
        <article className="portal-card">
          <div className="card-heading"><div><span>Metrics</span><h3>Performance Drivers</h3></div><FaChartLine /></div>
          <div className="timeline-list">
            <p><strong>Quality Score</strong><span>96%</span></p>
            <p><strong>Timely Delivery</strong><span>91%</span></p>
            <p><strong>Collaboration</strong><span>89%</span></p>
            <p><strong>Client Readiness</strong><span>94%</span></p>
          </div>
        </article>
      </section>

      <section className="portal-card">
        <div className="card-heading"><div><span>Highlights</span><h3>Recent Achievements</h3></div><FaStar /></div>
        <div className="announcement-list">
          <p>Completed documentation sprint before deadline.</p>
          <p>Maintained high quality score across technical writing reviews.</p>
          <p>Supported two urgent project handoffs without blockers.</p>
        </div>
      </section>
    </EmployeePortalLayout>
  );
}

export default EmployeePerformance;
