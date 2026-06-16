import { FaCalendarAlt, FaCheckCircle, FaExclamationTriangle, FaProjectDiagram, FaTasks } from "react-icons/fa";
import AdminPortalLayout from "./AdminPortalLayout";

const projects = [
  { name: "Client ERP Migration", owner: "Ananya Sen", status: "Active", progress: 78, deadline: "24 Jun" },
  { name: "Assignopedia LMS", owner: "Rahul Verma", status: "Delayed", progress: 54, deadline: "26 Jun" },
  { name: "Finance Automation", owner: "Sourav Das", status: "Completed", progress: 100, deadline: "18 Jun" },
  { name: "CRM Analytics", owner: "Neha Iyer", status: "Active", progress: 68, deadline: "03 Jul" },
];

function AdminProjects({ activePage, onNavigate }) {
  return (
    <AdminPortalLayout
      activePage={activePage}
      eyebrow="Delivery command"
      title="Project Management"
      description="Monitor active work, delayed delivery, completed releases, and upcoming deadlines."
      onNavigate={onNavigate}
      action={<button type="button"><FaProjectDiagram /> New Project</button>}
    >
      <section className="admin-card-grid compact-grid">
        <article className="admin-stat-card"><div><FaTasks /></div><span>Active Projects</span><strong>34</strong><small>12 in final sprint</small></article>
        <article className="admin-stat-card"><div><FaExclamationTriangle /></div><span>Delayed Projects</span><strong>06</strong><small>3 need escalation</small></article>
        <article className="admin-stat-card"><div><FaCheckCircle /></div><span>Completed Projects</span><strong>112</strong><small>18 this quarter</small></article>
        <article className="admin-stat-card"><div><FaCalendarAlt /></div><span>Upcoming Deadlines</span><strong>09</strong><small>Next 14 days</small></article>
      </section>

      <section className="admin-content-grid">
        <article className="admin-panel wide-panel">
          <div className="admin-panel-heading">
            <div><span>Projects</span><h2>Project Portfolio</h2></div>
            <FaProjectDiagram />
          </div>
          <div className="project-list large-list">
            {projects.map((project) => (
              <div key={project.name}>
                <p><strong>{project.name}</strong><span className={project.status.toLowerCase()}>{project.status}</span></p>
                <small>Owner: {project.owner} · Deadline: {project.deadline}</small>
                <span className="admin-progress"><i style={{ width: `${project.progress}%` }} /></span>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-panel side-panel">
          <div className="admin-panel-heading">
            <div><span>Deadlines</span><h2>Upcoming Deadlines</h2></div>
            <FaCalendarAlt />
          </div>
          <div className="timeline-list">
            {["Mobile QA freeze", "Client UAT handoff", "Billing integration", "Security review"].map((item, index) => (
              <p key={item}><strong>{item}</strong><span>{["20 Jun", "22 Jun", "26 Jun", "01 Jul"][index]}</span></p>
            ))}
          </div>
        </article>
      </section>
    </AdminPortalLayout>
  );
}

export default AdminProjects;
