import { useEffect, useMemo, useState } from "react";
import { FaDownload, FaFileAlt, FaPaperclip, FaTasks, FaUsers } from "react-icons/fa";
import { getCurrentUser } from "../../utils/authStorage";
import { getPortalResource } from "../../utils/portalDataApi";
import EmployeePortalLayout from "./EmployeePortalLayout";

const fallbackTasks = [
  { title: "Submit weekly research summary", due: "Today, 4:00 PM", priority: "High" },
  { title: "Review assignment brief updates", due: "Tomorrow, 11:30 AM", priority: "Medium" },
  { title: "Update project tracker notes", due: "Friday, 2:00 PM", priority: "Medium" },
  { title: "Prepare frontend glossary draft", due: "Monday, 10:00 AM", priority: "Low" },
];

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const getProjectTitle = (project) => project.title || project.name || "Untitled Project";

const getAssignments = (project) => (Array.isArray(project.assignments) ? project.assignments : []);

const getAttachments = (project) => (Array.isArray(project.attachments) ? project.attachments : []);

const formatAllocationDateTime = (value) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const downloadProjectDoc = (project, currentAssignment) => {
  const title = getProjectTitle(project);
  const collaborators = getAssignments(project).map((assignment) => assignment.name).join(", ") || "Only you";
  const attachments = getAttachments(project);
  const allocatedAt = formatAllocationDateTime(currentAssignment?.allocatedAt || project.createdAt);
  const html = `
    <html>
      <head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <p><strong>Allocated On:</strong> ${escapeHtml(allocatedAt)}</p>
        <p><strong>Your Word Count:</strong> ${Number(currentAssignment?.wordCount || 0).toLocaleString("en-IN")}</p>
        <p><strong>Total Word Count:</strong> ${Number(project.totalWordCount || 0).toLocaleString("en-IN")}</p>
        <p><strong>Team:</strong> ${escapeHtml(collaborators)}</p>
        <h2>Project Details</h2>
        <p>${escapeHtml(project.description || "No project description provided.").replace(/\n/g, "<br>")}</p>
        <h2>Attachments</h2>
        <ul>
          ${attachments.map((file) => `<li><a href="${escapeHtml(file.url)}">${escapeHtml(file.name || file.url)}</a></li>`).join("") || "<li>No attachments</li>"}
        </ul>
      </body>
    </html>
  `;
  const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${title.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "") || "project-details"}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

function EmployeeTasks({ activePage, onNavigate }) {
  const [tasks, setTasks] = useState(fallbackTasks);
  const [projects, setProjects] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const currentUser = getCurrentUser();
  const currentEmail = normalizeEmail(currentUser.email);
  const assignedProjects = useMemo(
    () =>
      projects.filter((project) =>
        getAssignments(project).some((assignment) => normalizeEmail(assignment.email) === currentEmail)
      ),
    [currentEmail, projects]
  );

  useEffect(() => {
    getPortalResource("tasks", fallbackTasks).then((data) => {
      setTasks(Array.isArray(data) && data.length ? data : fallbackTasks);
    });

    getPortalResource("projects", []).then((data) => {
      setProjects(Array.isArray(data) ? data : []);
    }).catch(() => setStatusMessage("Could not load assigned projects."));
  }, []);

  return (
    <EmployeePortalLayout activePage={activePage} eyebrow="Tasks" title="Task Workspace" onNavigate={onNavigate}>
      {statusMessage && <p className="employee-project-status">{statusMessage}</p>}

      <section className="portal-card assigned-projects-card">
        <div className="card-heading">
          <div><span>Projects</span><h3>Assigned Projects</h3></div>
          <FaTasks />
        </div>

        <div className="employee-assigned-project-list">
          {assignedProjects.length ? assignedProjects.map((project) => {
            const assignments = getAssignments(project);
            const currentAssignment = assignments.find((assignment) => normalizeEmail(assignment.email) === currentEmail);
            const collaborators = assignments.filter((assignment) => normalizeEmail(assignment.email) !== currentEmail);
            const attachments = getAttachments(project);
            const allocatedAt = formatAllocationDateTime(currentAssignment?.allocatedAt || project.createdAt);

            return (
              <article className="employee-project-card" key={project.id || getProjectTitle(project)}>
                <header>
                  <div>
                    <span>Project</span>
                    <h3>{getProjectTitle(project)}</h3>
                  </div>
                  <button type="button" onClick={() => downloadProjectDoc(project, currentAssignment)}>
                    <FaDownload /> DOC
                  </button>
                </header>

                <div className="employee-project-meta">
                  <p><strong>{Number(currentAssignment?.wordCount || 0).toLocaleString("en-IN")}</strong><span>Your words</span></p>
                  <p><strong>{Number(project.totalWordCount || 0).toLocaleString("en-IN")}</strong><span>Total words</span></p>
                  <p><strong>{attachments.length}</strong><span>Files</span></p>
                  <p><strong>{allocatedAt}</strong><span>Allocated on</span></p>
                </div>

                <section>
                  <h4><FaFileAlt /> Project Details</h4>
                  <p>{project.description || "No project details provided yet."}</p>
                </section>

                <section>
                  <h4><FaUsers /> Team Members</h4>
                  <div className="employee-project-team">
                    <span>You</span>
                    {collaborators.map((assignment) => <span key={assignment.email}>{assignment.name}</span>)}
                  </div>
                </section>

                <section>
                  <h4><FaPaperclip /> Attachments</h4>
                  <div className="employee-project-attachments">
                    {attachments.length ? attachments.map((file) => (
                      <a key={file.publicId || file.url} href={file.url} target="_blank" rel="noreferrer">
                        <FaPaperclip />
                        <span>{file.name || "Project file"}</span>
                        <small>{file.fileType || file.resourceType || "File"}</small>
                      </a>
                    )) : <p>No files attached.</p>}
                  </div>
                </section>
              </article>
            );
          }) : (
            <p className="employee-project-empty">No projects assigned to your registered email yet.</p>
          )}
        </div>
      </section>

      <section className="portal-card">
        <div className="card-heading">
          <div><span>Pending</span><h3>Assigned Tasks</h3></div>
          <FaTasks />
        </div>
        <div className="task-list">
          {tasks.map((task) => (
            <div className="task-row" key={task.title}>
              <FaTasks />
              <div><strong>{task.title}</strong><small>{task.due} - {task.priority}</small></div>
            </div>
          ))}
        </div>
      </section>
    </EmployeePortalLayout>
  );
}

export default EmployeeTasks;
