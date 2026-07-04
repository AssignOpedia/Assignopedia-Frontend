import { useEffect, useState } from "react";
import { FaBriefcase } from "react-icons/fa";
import { getPortalResource } from "../../utils/portalDataApi";
import EmployeePortalLayout from "./EmployeePortalLayout";

const fallbackProjects = [
  { name: "Client Research Portal", progress: 82, status: "In Review" },
  { name: "Academic CRM Upgrade", progress: 64, status: "In Progress" },
  { name: "Content Quality Audit", progress: 91, status: "Final Checks" },
  { name: "Frontend Documentation Kit", progress: 73, status: "Drafting" },
];

function EmployeeProjects({ activePage, onNavigate }) {
  const [projects, setProjects] = useState(fallbackProjects);

  useEffect(() => {
    getPortalResource("projects", fallbackProjects).then((data) => {
      setProjects(Array.isArray(data) && data.length ? data : fallbackProjects);
    });
  }, []);

  return (
    <EmployeePortalLayout activePage={activePage} eyebrow="Projects" title="Assigned Projects" onNavigate={onNavigate}>
      <section className="portal-card">
        <div className="card-heading">
          <div><span>Project Board</span><h3>Current Workload</h3></div>
          <FaBriefcase />
        </div>
        <div className="project-list">
          {projects.map((project) => (
            <div className="project-row" key={project.name}>
              <div><strong>{project.name}</strong><small>{project.status}</small></div>
              <span>{project.progress}%</span>
              <div className="project-progress"><i style={{ width: `${project.progress}%` }} /></div>
            </div>
          ))}
        </div>
      </section>
    </EmployeePortalLayout>
  );
}

export default EmployeeProjects;
