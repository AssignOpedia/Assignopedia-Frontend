import { useEffect, useMemo, useState } from "react";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFileUpload,
  FaProjectDiagram,
  FaTimes,
  FaTasks,
  FaUsers,
} from "react-icons/fa";
import { getPortalResource, savePortalResource } from "../../utils/portalDataApi";
import { uploadFileToCloudinary } from "../../utils/uploadApi";
import AdminPortalLayout from "./AdminPortalLayout";

const apiBaseUrl = import.meta.env.VITE_API_URL || "/api";

const fallbackProjects = [
  { id: "project-1", name: "Client ERP Migration", owner: "Ananya Sen", status: "Active", progress: 78, deadline: "24 Jun" },
  { id: "project-2", name: "Assignopedia LMS", owner: "Rahul Verma", status: "Delayed", progress: 54, deadline: "26 Jun" },
  { id: "project-3", name: "Finance Automation", owner: "Sourav Das", status: "Completed", progress: 100, deadline: "18 Jun" },
  { id: "project-4", name: "CRM Analytics", owner: "Neha Iyer", status: "Active", progress: 68, deadline: "03 Jul" },
];

const emptyForm = {
  title: "",
  description: "",
  totalWordCount: "",
  assignments: {},
  files: [],
};

const getProjectTitle = (project) => project.title || project.name || "Untitled Project";

const getProjectAssignments = (project) => (Array.isArray(project.assignments) ? project.assignments : []);

const fetchEmployeeAccounts = async () => {
  const response = await fetch(`${apiBaseUrl}/accounts`);
  const accounts = await response.json().catch(() => []);

  if (!response.ok) {
    throw new Error(accounts.message || "Could not load employee accounts.");
  }

  return accounts.filter((account) => account.role === "employee");
};

function AdminProjects({ activePage, onNavigate }) {
  const [projects, setProjects] = useState(fallbackProjects);
  const [employees, setEmployees] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const selectedEmployees = useMemo(
    () => employees.filter((employee) => Object.prototype.hasOwnProperty.call(form.assignments, employee.email)),
    [employees, form.assignments]
  );

  useEffect(() => {
    getPortalResource("projects", fallbackProjects).then((data) => {
      setProjects(Array.isArray(data) && data.length ? data : fallbackProjects);
    });
    fetchEmployeeAccounts()
      .then(setEmployees)
      .catch((error) => setStatusMessage(error.message));
  }, []);

  const activeCount = projects.filter((project) => project.status === "Active").length;
  const delayedCount = projects.filter((project) => project.status === "Delayed").length;
  const completedCount = projects.filter((project) => project.status === "Completed").length;

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const toggleEmployee = (employee) => {
    setForm((current) => {
      const assignments = { ...current.assignments };

      if (Object.prototype.hasOwnProperty.call(assignments, employee.email)) {
        delete assignments[employee.email];
      } else {
        assignments[employee.email] = "";
      }

      return { ...current, assignments };
    });
  };

  const updateEmployeeWordCount = (email, value) => {
    setForm((current) => ({
      ...current,
      assignments: { ...current.assignments, [email]: value },
    }));
  };

  const handleFilesChange = (event) => {
    const files = Array.from(event.target.files || []);
    setForm((current) => ({ ...current, files }));
  };

  const resetDrawer = () => {
    setForm(emptyForm);
    setStatusMessage("");
    setDrawerOpen(false);
  };

  const saveProject = async (event) => {
    event.preventDefault();
    setStatusMessage("");

    if (!form.title.trim()) {
      setStatusMessage("Project title is required.");
      return;
    }

    if (selectedEmployees.length === 0) {
      setStatusMessage("Assign this project to at least one employee.");
      return;
    }

    setIsSaving(true);

    try {
      const uploadedFiles = [];

      for (const file of form.files) {
        const upload = await uploadFileToCloudinary(file, {
          folder: "assignopedia/project-management",
          resourceType: "auto",
        });

        uploadedFiles.push({
          name: file.name,
          url: upload.url,
          publicId: upload.publicId,
          resourceType: upload.resourceType,
          fileType: file.type || upload.fileType || "application/octet-stream",
          size: upload.bytes || file.size,
          uploadedAt: new Date().toISOString(),
        });
      }

      const now = new Date().toISOString();
      const assignments = selectedEmployees.map((employee) => ({
        name: employee.name,
        email: employee.email,
        role: employee.role,
        wordCount: Number(form.assignments[employee.email] || 0),
        allocatedAt: now,
      }));
      const project = {
        id: `project-${Date.now()}`,
        title: form.title.trim(),
        name: form.title.trim(),
        description: form.description.trim(),
        totalWordCount: Number(form.totalWordCount || 0),
        assignments,
        assignedEmails: assignments.map((assignment) => assignment.email),
        attachments: uploadedFiles,
        owner: assignments.map((assignment) => assignment.name).join(", "),
        status: "Active",
        progress: 0,
        deadline: "Not set",
        createdAt: now,
        updatedAt: now,
      };
      const nextProjects = [project, ...projects.filter((item) => item.id !== project.id)];
      const savedProjects = await savePortalResource("projects", nextProjects);

      setProjects(Array.isArray(savedProjects) ? savedProjects : nextProjects);
      setStatusMessage("Project saved and assigned to employee accounts.");
      setForm(emptyForm);
      setDrawerOpen(false);
    } catch (error) {
      setStatusMessage(error.message || "Could not save project.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminPortalLayout
      activePage={activePage}
      eyebrow="Delivery command"
      title="Project Management"
      description="Create projects, assign employees, upload files, and sync task details to employee accounts."
      onNavigate={onNavigate}
      action={<button type="button" onClick={() => setDrawerOpen(true)}><FaProjectDiagram /> New Project</button>}
    >
      <section className="admin-card-grid compact-grid">
        <article className="admin-stat-card"><div><FaTasks /></div><span>Active Projects</span><strong>{activeCount}</strong><small>Synced from MongoDB</small></article>
        <article className="admin-stat-card"><div><FaExclamationTriangle /></div><span>Delayed Projects</span><strong>{delayedCount}</strong><small>Need escalation</small></article>
        <article className="admin-stat-card"><div><FaCheckCircle /></div><span>Completed Projects</span><strong>{completedCount}</strong><small>Delivered</small></article>
        <article className="admin-stat-card"><div><FaCalendarAlt /></div><span>Total Projects</span><strong>{projects.length}</strong><small>Project Management collection</small></article>
      </section>

      {statusMessage && <p className="admin-project-status">{statusMessage}</p>}

      <section className="admin-content-grid">
        <article className="admin-panel wide-panel">
          <div className="admin-panel-heading">
            <div><span>Projects</span><h2>Project Portfolio</h2></div>
            <FaProjectDiagram />
          </div>
          <div className="project-list large-list">
            {projects.map((project) => {
              const assignments = getProjectAssignments(project);

              return (
                <div key={project.id || getProjectTitle(project)}>
                  <p><strong>{getProjectTitle(project)}</strong><span className={String(project.status || "Active").toLowerCase()}>{project.status || "Active"}</span></p>
                  <small>
                    Assigned: {assignments.length ? assignments.map((assignment) => assignment.name).join(", ") : project.owner || "Not assigned"} |
                    Words: {Number(project.totalWordCount || 0).toLocaleString("en-IN")} |
                    Files: {project.attachments?.length || 0}
                  </small>
                  <span className="admin-progress"><i style={{ width: `${Number(project.progress || 0)}%` }} /></span>
                </div>
              );
            })}
          </div>
        </article>

        <article className="admin-panel side-panel">
          <div className="admin-panel-heading">
            <div><span>Assignments</span><h2>Employee Delivery</h2></div>
            <FaUsers />
          </div>
          <div className="timeline-list">
            {projects.slice(0, 5).map((project) => (
              <p key={project.id || getProjectTitle(project)}>
                <strong>{getProjectTitle(project)}</strong>
                <span>{getProjectAssignments(project).length || 0} assigned</span>
              </p>
            ))}
          </div>
        </article>
      </section>

      {drawerOpen && (
        <div className="project-drawer-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && resetDrawer()}>
          <aside className="project-drawer" aria-label="Create new project">
            <header>
              <div>
                <span>New Project</span>
                <h2>Assign Project</h2>
              </div>
              <button type="button" onClick={resetDrawer} aria-label="Close new project sidebar"><FaTimes /></button>
            </header>

            <form className="project-drawer-form" onSubmit={saveProject}>
              <label>
                <span>Project Title</span>
                <input name="title" value={form.title} onChange={updateField} placeholder="Enter project title" required />
              </label>

              <label>
                <span>Total Word Count</span>
                <input name="totalWordCount" type="number" min="0" value={form.totalWordCount} onChange={updateField} placeholder="0" />
              </label>

              <section className="project-drawer-section">
                <div className="project-drawer-section-title">
                  <span>Assign Employees</span>
                  <small>{selectedEmployees.length} selected</small>
                </div>
                <div className="project-employee-picker">
                  {employees.length ? employees.map((employee) => (
                    <label className="project-employee-option" key={`${employee.role}-${employee.email}`}>
                      <input
                        type="checkbox"
                        checked={Object.prototype.hasOwnProperty.call(form.assignments, employee.email)}
                        onChange={() => toggleEmployee(employee)}
                      />
                      <span><strong>{employee.name}</strong><small>{employee.email}</small></span>
                    </label>
                  )) : <p className="admin-empty-state">No registered employee accounts found.</p>}
                </div>
              </section>

              {selectedEmployees.length > 0 && (
                <section className="project-drawer-section">
                  <div className="project-drawer-section-title">
                    <span>Employee Word Allocation</span>
                    <small>Individual counts</small>
                  </div>
                  <div className="project-word-allocation">
                    {selectedEmployees.map((employee) => (
                      <label key={employee.email}>
                        <span>{employee.name}</span>
                        <input
                          type="number"
                          min="0"
                          value={form.assignments[employee.email]}
                          onChange={(event) => updateEmployeeWordCount(employee.email, event.target.value)}
                          placeholder="Words"
                        />
                      </label>
                    ))}
                  </div>
                </section>
              )}

              <label className="project-upload-zone">
                <FaFileUpload />
                <strong>Upload files, images, and audio</strong>
                <small>{form.files.length ? `${form.files.length} selected` : "Multiple uploads supported"}</small>
                <input type="file" multiple accept="image/*,audio/*,.pdf,.doc,.docx,.txt,.xlsx,.csv,.zip" onChange={handleFilesChange} />
              </label>

              <label>
                <span>Project Details / Description</span>
                <textarea name="description" value={form.description} onChange={updateField} placeholder="Write all project instructions, references, and delivery notes." />
              </label>

              {statusMessage && <p className="admin-project-status">{statusMessage}</p>}

              <button type="submit" disabled={isSaving}>
                <FaProjectDiagram /> {isSaving ? "Saving Project..." : "Save and Assign Project"}
              </button>
            </form>
          </aside>
        </div>
      )}
    </AdminPortalLayout>
  );
}

export default AdminProjects;
