import { useEffect, useMemo, useState } from "react";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaDownload,
  FaExclamationTriangle,
  FaFileUpload,
  FaProjectDiagram,
  FaTimes,
  FaTasks,
  FaUsers,
} from "react-icons/fa";
import { getPortalResource, savePortalResource } from "../../utils/portalDataApi";
import { addEmployeeProjectNotifications } from "../../utils/requestNotifications";
import { loadTaskSubmissions } from "../../utils/taskSubmissionApi";
import { uploadFileToCloudinary } from "../../utils/uploadApi";
import AdminPortalLayout from "./AdminPortalLayout";

const apiBaseUrl = import.meta.env.VITE_API_URL || "/api";

const fallbackProjects = [
  { id: "project-1", name: "Client ERP Migration", owner: "Ananya Sen", status: "Active", progress: 78, deadline: "24 Jun" },
];

const removedSampleProjectIds = new Set(["project-2", "project-3", "project-4"]);
const removedSampleProjectNames = new Set(["Assignopedia LMS", "Finance Automation", "CRM Analytics"]);

const emptyForm = {
  title: "",
  description: "",
  totalWordCount: "",
  deadlineDate: "",
  deadlineTime: "",
  assignments: {},
  files: [],
};

const getProjectTitle = (project) => project.title || project.name || "Untitled Project";

const getProjectAssignments = (project) => (Array.isArray(project.assignments) ? project.assignments : []);

const getSubmissionFiles = (submission) => (Array.isArray(submission.files) ? submission.files : []);

const isRemovedSampleProject = (project) =>
  removedSampleProjectIds.has(project.id) || removedSampleProjectNames.has(getProjectTitle(project));

const cleanProjectList = (projects) => projects.filter((project) => !isRemovedSampleProject(project));

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const formatDateTime = (value) => {
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

const formatFileSize = (bytes = 0) => {
  const size = Number(bytes || 0);

  if (!size) {
    return "File";
  }

  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const getDownloadUrl = (file = {}) => {
  const url = file.url || "";

  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }

  const fileName = String(file.name || "submitted-file").replace(/[^a-z0-9._-]+/gi, "-");
  return url.replace("/upload/", `/upload/fl_attachment:${encodeURIComponent(fileName)}/`);
};

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
  const [taskSubmissions, setTaskSubmissions] = useState([]);
  const [expandedProjectId, setExpandedProjectId] = useState("");
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
    let isMounted = true;

    const openTargetSubmission = () => {
      const rawTarget = window.localStorage.getItem("assignopedia-admin-project-target");

      if (!rawTarget) {
        return;
      }

      try {
        const target = JSON.parse(rawTarget);

        if (target?.projectId) {
          setExpandedProjectId(String(target.projectId));
        }
      } catch {
        // Ignore malformed navigation targets.
      } finally {
        window.localStorage.removeItem("assignopedia-admin-project-target");
      }
    };

    const refreshProjectData = async () => {
      const [data, submissions] = await Promise.all([
        getPortalResource("projects", fallbackProjects),
        loadTaskSubmissions(),
      ]);

      if (!isMounted) {
        return;
      }

      const loadedProjects = Array.isArray(data) && data.length ? data : fallbackProjects;
      const cleanedProjects = cleanProjectList(loadedProjects);

      setProjects(cleanedProjects);
      setTaskSubmissions(Array.isArray(submissions) ? submissions : []);
      openTargetSubmission();

      if (cleanedProjects.length !== loadedProjects.length) {
        savePortalResource("projects", cleanedProjects).catch(() => {});
      }
    };

    refreshProjectData().catch(() => setStatusMessage("Could not load project submissions."));
    const refreshInterval = window.setInterval(() => {
      refreshProjectData().catch(() => {});
    }, 5000);
    const refreshOnFocus = () => {
      refreshProjectData().catch(() => {});
    };

    window.addEventListener("focus", refreshOnFocus);
    fetchEmployeeAccounts()
      .then(setEmployees)
      .catch((error) => setStatusMessage(error.message));

    return () => {
      isMounted = false;
      window.clearInterval(refreshInterval);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, []);

  const activeCount = projects.filter((project) => project.status === "Active").length;
  const delayedCount = projects.filter((project) => project.status === "Delayed").length;
  const completedCount = projects.filter((project) => project.status === "Completed").length;
  const deliveredCount = projects.filter((project) => project.deliveredAt || project.status === "Completed").length;

  const getProjectSubmissions = (project) =>
    taskSubmissions
      .filter((submission) => String(submission.projectId || "") === String(project.id || getProjectTitle(project)))
      .sort((a, b) => new Date(b.submittedAt || b.createdAt || 0) - new Date(a.submittedAt || a.createdAt || 0));

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
      const deadlineDateTime = form.deadlineDate && form.deadlineTime
        ? new Date(`${form.deadlineDate}T${form.deadlineTime}:00+05:30`).toISOString()
        : "";
      const assignments = selectedEmployees.map((employee) => ({
        name: employee.name,
        email: employee.email,
        role: employee.role,
        wordCount: Number(form.assignments[employee.email] || 0),
        status: "Pending",
        submissionStatus: "Pending",
        allocatedAt: now,
      }));
      const project = {
        id: `project-${Date.now()}`,
        title: form.title.trim(),
        name: form.title.trim(),
        description: form.description.trim(),
        totalWordCount: Number(form.totalWordCount || 0),
        deadlineDate: form.deadlineDate,
        deadlineTime: form.deadlineTime,
        deadlineDateTime,
        assignments,
        assignedEmails: assignments.map((assignment) => assignment.email),
        attachments: uploadedFiles,
        owner: assignments.map((assignment) => assignment.name).join(", "),
        status: "Active",
        progress: 0,
        deadline: deadlineDateTime || "Not set",
        createdAt: now,
        updatedAt: now,
      };
      const nextProjects = [project, ...projects.filter((item) => item.id !== project.id)];
      const savedProjects = await savePortalResource("projects", nextProjects);
      await addEmployeeProjectNotifications({
        projectId: project.id,
        projectTitle: project.title,
        assignments,
        allocatedAt: now,
        totalWordCount: project.totalWordCount,
      }).catch(() => {});

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
        <article className="admin-stat-card"><div><FaCheckCircle /></div><span>Completed Projects</span><strong>{completedCount}</strong><small>Delivered: {deliveredCount}</small></article>
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
              const projectId = project.id || getProjectTitle(project);
              const submissions = getProjectSubmissions(project);
              const isExpanded = expandedProjectId === projectId;

              return (
                <div key={projectId}>
                  <button
                    className={`project-summary-trigger${submissions.length > 0 ? " has-submissions" : ""}`}
                    type="button"
                    disabled={submissions.length === 0}
                    aria-expanded={isExpanded}
                    onClick={() => setExpandedProjectId(isExpanded ? "" : projectId)}
                  >
                    <p><strong>{getProjectTitle(project)}</strong><span className={String(project.status || "Active").toLowerCase()}>{project.status || "Active"}</span></p>
                    <small>
                      Assigned: {assignments.length ? assignments.map((assignment) => assignment.name).join(", ") : project.owner || "Not assigned"} |
                      Words: {Number(project.totalWordCount || 0).toLocaleString("en-IN")} |
                      Files: {project.attachments?.length || 0} |
                      Submissions: {submissions.length} |
                      Deadline: {formatDateTime(project.deadlineDateTime || project.deadline)}
                    </small>
                    <span className="admin-progress"><i style={{ width: `${Number(project.progress || 0)}%` }} /></span>
                  </button>
                  {isExpanded && (
                    <section className="project-submission-details">
                      <h3>Submitted Work</h3>
                      {submissions.map((submission) => {
                        const assignment = assignments.find(
                          (item) => normalizeEmail(item.email) === normalizeEmail(submission.employeeEmail)
                        );
                        const submittedFiles = getSubmissionFiles(submission);

                        return (
                          <article key={submission.id || submission.submittedAt} className="project-submission-card">
                            <div className="project-submission-meta">
                              <p><strong>{submission.employeeName || assignment?.name || "Employee"}</strong><span>{submission.employeeEmail}</span></p>
                              <p><strong>{formatDateTime(submission.submittedAt || submission.createdAt)}</strong><span>Submitted on</span></p>
                              <p><strong>{formatDateTime(submission.deadlineDateTime || project.deadlineDateTime || project.deadline)}</strong><span>Deadline</span></p>
                              <p><strong>{submittedFiles.length}</strong><span>Files uploaded</span></p>
                              <p><strong>{submission.submissionTimingStatus || (submission.submittedOnTime === false ? "Late" : "On Time")}</strong><span>Performance</span></p>
                            </div>

                            {submission.comment && (
                              <div className="project-submission-note">
                                <strong>Submission Note</strong>
                                <p>{submission.comment}</p>
                              </div>
                            )}

                            <div className="project-submission-files">
                              {submittedFiles.length ? submittedFiles.map((file) => (
                                <a key={file.publicId || file.url} href={getDownloadUrl(file)} target="_blank" rel="noreferrer" download>
                                  <FaDownload />
                                  <span>{file.name || "Submitted file"}</span>
                                  <small>{formatFileSize(file.size)}</small>
                                </a>
                              )) : <p>No submitted files found.</p>}
                            </div>
                          </article>
                        );
                      })}
                    </section>
                  )}
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
                  <span>Project Deadline</span>
                  <small>Date and time</small>
                </div>
                <div className="project-deadline-fields">
                  <label>
                    <span>Deadline Date</span>
                    <input name="deadlineDate" type="date" value={form.deadlineDate} onChange={updateField} />
                  </label>
                  <label>
                    <span>Deadline Time</span>
                    <input name="deadlineTime" type="time" value={form.deadlineTime} onChange={updateField} />
                  </label>
                </div>
              </section>

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
