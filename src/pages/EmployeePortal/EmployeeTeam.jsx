import { FaSitemap, FaUserTie, FaUsers } from "react-icons/fa";
import EmployeePortalLayout from "./EmployeePortalLayout";

function EmployeeTeam({ activePage, onNavigate }) {
  return (
    <EmployeePortalLayout activePage={activePage} eyebrow="Team" title="Team Structure" onNavigate={onNavigate}>
      <section className="portal-insight-grid">
        <article className="portal-card detail-card">
          <div className="card-icon"><FaUserTie /></div>
          <span>Team Leader</span>
          <strong>Tapajit Da</strong>
        </article>
        <article className="portal-card detail-card">
          <div className="card-icon"><FaUsers /></div>
          <span>Team Size</span>
          <strong>12 Members</strong>
        </article>
        <article className="portal-card detail-card">
          <div className="card-icon"><FaSitemap /></div>
          <span>Department</span>
          <strong>Development Team</strong>
        </article>
      </section>

      <section className="portal-card">
        <div className="card-heading">
          <div>
            <span>Hierarchy</span>
            <h3>Reporting Flow</h3>
          </div>
        </div>
        <div className="team-stack">
          <div><strong>Tapajit Da</strong><small>Team Leader</small></div>
          <div><strong>Sandipan Mondal</strong><small>Technical Content Writer</small></div>
          <div><strong>Development Team</strong><small>Frontend, content, and documentation pod</small></div>
        </div>
      </section>
    </EmployeePortalLayout>
  );
}

export default EmployeeTeam;
