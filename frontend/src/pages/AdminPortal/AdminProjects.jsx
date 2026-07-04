import { useEffect, useState } from "react";
import { FaCalendarAlt, FaCheckCircle, FaExclamationTriangle, FaProjectDiagram, FaTasks } from "react-icons/fa";
import { getPortalResource } from "../../utils/portalDataApi";
import AdminPortalLayout from "./AdminPortalLayout";

const fallbackProjects = [
  { name: "Client ERP Migration", owner: "Ananya Sen", status: "Active", progress: 78, deadline: "24 Jun" },
  { name: "Assignopedia LMS", owner: "Rahul Verma", status: "Delayed", progress: 54, deadline: "26 Jun" },
  { name: "Finance Automation", owner: "Sourav Das", status: "Completed", progress: 100, deadline: "18 Jun" },
  { name: "CRM Analytics", owner: "Neha Iyer", status: "Active", progress: 68, deadline: "03 Jul" },
];

function AdminProjects({ activePage, onNavigate }) {
  const [projects, setProjects] = useState(fallbackProjects);

  useEffect(() => {
    getPortalResource("projects", fallbackProjects).then((data) => {
      setProjects(Array.isArray(data) && data.length ? data : fallbackProjects);
    });
  }, []);

  const activeCount = projects.filter((project) => project.status === "Active").length;
  const delayedCount = projects.filter((project) => project.status === "Delayed").length;
  const completedCount = projects.filter((project) => project.status === "Completed").length;

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
        <article className="admin-stat-card"><div><FaTasks /></div><span>Active Projects</span><strong>{activeCount}</strong><small>Synced from backend</small></article>
        <article className="admin-stat-card"><div><FaExclamationTriangle /></div><span>Delayed Projects</span><strong>{delayedCount}</strong><small>Need escalation</small></article>
        <article className="admin-stat-card"><div><FaCheckCircle /></div><span>Completed Projects</span><strong>{completedCount}</strong><small>Delivered</small></article>
        <article className="admin-stat-card"><div><FaCalendarAlt /></div><span>Total Projects</span><strong>{projects.length}</strong><small>Express API</small></article>
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
