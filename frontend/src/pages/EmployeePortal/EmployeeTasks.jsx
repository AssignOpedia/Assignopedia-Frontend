import { useEffect, useMemo, useState } from "react";
import { FaDownload, FaFileAlt, FaPaperclip, FaTasks, FaUpload, FaUsers } from "react-icons/fa";
import { getCurrentUser } from "../../utils/authStorage";
import { getEmployeeProjectTargetKey } from "../../utils/employeeNotificationNavigation";
import { getPortalResource } from "../../utils/portalDataApi";
import { loadTaskSubmissions, submitCompletedTaskFiles } from "../../utils/taskSubmissionApi";
import EmployeePortalLayout from "./EmployeePortalLayout";

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const getProjectTitle = (project) => project.title || project.name || "Untitled Project";

const getAssignments = (project) => (Array.isArray(project.assignments) ? project.assignments : []);

const getAttachments = (project) => (Array.isArray(project.attachments) ? project.attachments : []);

const getSubmissionFiles = (submission) => (Array.isArray(submission.files) ? submission.files : []);

const getProjectDeadline = (project) => project.deadlineDateTime || project.deadline || "";

const getProjectElementId = (projectId) =>
  `employee-project-${String(projectId || "").replace(/[^a-z0-9_-]+/gi, "-")}`;

const getEmployeeProjectSubmission = (submissions, projectId, employeeEmail) =>
  submissions
    .filter(
      (submission) =>
        String(submission.projectId || "") === String(projectId) &&
        normalizeEmail(submission.employeeEmail) === normalizeEmail(employeeEmail)
    )
    .sort((a, b) => new Date(b.submittedAt || b.createdAt || 0) - new Date(a.submittedAt || a.createdAt || 0))[0] || null;

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

const downloadProjectDoc = (project, currentAssignment) => {
  const title = getProjectTitle(project);
  const collaborators = getAssignments(project).map((assignment) => assignment.name).join(", ") || "Only you";
  const attachments = getAttachments(project);
  const allocatedAt = formatAllocationDateTime(currentAssignment?.allocatedAt || project.createdAt);
  const deadlineAt = formatAllocationDateTime(getProjectDeadline(project));
  const html = `
    <html>
      <head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <p><strong>Allocated On:</strong> ${escapeHtml(allocatedAt)}</p>
        <p><strong>Deadline:</strong> ${escapeHtml(deadlineAt)}</p>
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
  const [projects, setProjects] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmissionFiles, setSelectedSubmissionFiles] = useState({});
  const [submissionComments, setSubmissionComments] = useState({});
  const [submittingProjectId, setSubmittingProjectId] = useState("");
  const [submissionMessages, setSubmissionMessages] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const [highlightedProjectId, setHighlightedProjectId] = useState("");
  const currentUser = getCurrentUser();
  const currentEmail = normalizeEmail(currentUser.email);
  const assignedProjects = useMemo(
    () =>
      projects.filter((project) =>
        getAssignments(project).some((assignment) => normalizeEmail(assignment.email) === currentEmail)
      ),
    [currentEmail, projects]
  );
  const pendingTasks = useMemo(
    () =>
      assignedProjects
        .map((project) => {
          const projectId = project.id || getProjectTitle(project);
          const assignment = getAssignments(project).find((item) => normalizeEmail(item.email) === currentEmail);
          const submission = getEmployeeProjectSubmission(submissions, projectId, currentEmail);

          return {
            id: projectId,
            title: getProjectTitle(project),
            due: formatAllocationDateTime(getProjectDeadline(project)),
            priority: project.priority || "Pending",
            project,
            assignment,
            submission,
          };
        })
        .filter((task) => !task.submission),
    [assignedProjects, currentEmail, submissions]
  );

  useEffect(() => {
    getPortalResource("projects", []).then((data) => {
      setProjects(Array.isArray(data) ? data : []);
    }).catch(() => setStatusMessage("Could not load assigned projects."));

    loadTaskSubmissions()
      .then((data) => setSubmissions(Array.isArray(data) ? data : []))
      .catch(() => setStatusMessage("Could not load task submissions."));
  }, []);

  useEffect(() => {
    const rawTarget = window.localStorage.getItem(getEmployeeProjectTargetKey());

    if (!rawTarget || assignedProjects.length === 0) {
      return;
    }

    try {
      const target = JSON.parse(rawTarget);
      const targetProjectId = String(target.projectId || "");
      const matchingProject = assignedProjects.find(
        (project) => String(project.id || getProjectTitle(project)) === targetProjectId
      );

      if (!matchingProject) {
        return;
      }

      setHighlightedProjectId(targetProjectId);
      window.localStorage.removeItem(getEmployeeProjectTargetKey());
      window.setTimeout(() => {
        document.getElementById(getProjectElementId(targetProjectId))?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    } catch {
      window.localStorage.removeItem(getEmployeeProjectTargetKey());
    }
  }, [assignedProjects]);

  const handleSubmissionFileChange = (projectId, files) => {
    setSelectedSubmissionFiles((current) => ({
      ...current,
      [projectId]: Array.from(files || []),
    }));
    setSubmissionMessages((current) => ({
      ...current,
      [projectId]: "",
    }));
  };

  const handleSubmissionCommentChange = (projectId, comment) => {
    setSubmissionComments((current) => ({
      ...current,
      [projectId]: comment,
    }));
    setSubmissionMessages((current) => ({
      ...current,
      [projectId]: "",
    }));
  };

  const handleSubmitCompletedWork = async (event, project, assignment) => {
    event.preventDefault();

    const projectId = project.id || getProjectTitle(project);
    const files = selectedSubmissionFiles[projectId] || [];

    if (!files.length) {
      setSubmissionMessages((current) => ({
        ...current,
        [projectId]: "Please select at least one completed work file.",
      }));
      return;
    }

    setSubmittingProjectId(projectId);
    setSubmissionMessages((current) => ({
      ...current,
      [projectId]: "Uploading completed files to Cloudinary...",
    }));

    try {
      const { item, items, projects: savedProjects } = await submitCompletedTaskFiles({
        project: { ...project, id: projectId },
        assignment,
        employee: currentUser,
        files,
        comment: submissionComments[projectId] || "",
      });

      setSubmissions(Array.isArray(items) ? items : [item, ...submissions]);
      if (Array.isArray(savedProjects)) {
        setProjects(savedProjects);
      }
      setSelectedSubmissionFiles((current) => ({
        ...current,
        [projectId]: [],
      }));
      setSubmissionComments((current) => ({
        ...current,
        [projectId]: "",
      }));
      setSubmissionMessages((current) => ({
        ...current,
        [projectId]: "Completed work submitted successfully.",
      }));
    } catch (error) {
      setSubmissionMessages((current) => ({
        ...current,
        [projectId]: error.message || "Could not submit completed work.",
      }));
    } finally {
      setSubmittingProjectId("");
    }
  };

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
            const projectId = project.id || getProjectTitle(project);
            const assignments = getAssignments(project);
            const currentAssignment = assignments.find((assignment) => normalizeEmail(assignment.email) === currentEmail);
            const collaborators = assignments.filter((assignment) => normalizeEmail(assignment.email) !== currentEmail);
            const attachments = getAttachments(project);
            const allocatedAt = formatAllocationDateTime(currentAssignment?.allocatedAt || project.createdAt);
            const deadlineAt = formatAllocationDateTime(getProjectDeadline(project));
            const selectedFiles = selectedSubmissionFiles[projectId] || [];
            const submissionComment = submissionComments[projectId] || "";
            const projectSubmissions = submissions
              .filter(
                (submission) =>
                  String(submission.projectId || "") === String(projectId) &&
                  normalizeEmail(submission.employeeEmail) === currentEmail
              )
              .sort((a, b) => new Date(b.submittedAt || b.createdAt || 0) - new Date(a.submittedAt || a.createdAt || 0));
            const latestSubmission = projectSubmissions[0] || null;
            const assignmentStatus = latestSubmission
              ? "Completed"
              : currentAssignment?.submissionStatus || currentAssignment?.status || "Pending";

            return (
              <article
                className={`employee-project-card${highlightedProjectId === String(projectId) ? " is-targeted" : ""}`}
                id={getProjectElementId(projectId)}
                key={projectId}
              >
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
                  <p><strong>{deadlineAt}</strong><span>Deadline</span></p>
                  <p><strong>{assignmentStatus}</strong><span>Status</span></p>
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

                <section className="employee-task-submission">
                  <h4><FaUpload /> Submit Completed Work</h4>
                  <form onSubmit={(event) => handleSubmitCompletedWork(event, project, currentAssignment)}>
                    <label className="employee-submission-comment">
                      <span>Submission Comment</span>
                      <textarea
                        value={submissionComment}
                        onChange={(event) => handleSubmissionCommentChange(projectId, event.target.value)}
                        placeholder="Write a note, message, or submission comment for this task."
                        rows={3}
                      />
                    </label>
                    <label className="employee-submission-upload">
                      <input
                        type="file"
                        multiple
                        onChange={(event) => handleSubmissionFileChange(projectId, event.target.files)}
                      />
                      <span><FaPaperclip /> Choose completed files</span>
                      <small>
                        {selectedFiles.length
                          ? `${selectedFiles.length} selected: ${selectedFiles.map((file) => file.name).join(", ")}`
                          : "Upload multiple files, images, audio, documents, or archives."}
                      </small>
                    </label>
                    <button type="submit" disabled={submittingProjectId === projectId}>
                      <FaUpload /> {submittingProjectId === projectId ? "Submitting..." : "Submit Work"}
                    </button>
                  </form>
                  {submissionMessages[projectId] && (
                    <p className="employee-submission-message">{submissionMessages[projectId]}</p>
                  )}

                  {projectSubmissions.length > 0 && (
                    <div className="employee-submission-history">
                      <strong>Submitted Files</strong>
                      {projectSubmissions.map((submission) => (
                        <div key={submission.id || submission.submittedAt}>
                          <span>{formatAllocationDateTime(submission.submittedAt || submission.createdAt)}</span>
                          {submission.comment && <p>{submission.comment}</p>}
                          <div>
                            {getSubmissionFiles(submission).map((file) => (
                              <a key={file.publicId || file.url} href={file.url} target="_blank" rel="noreferrer">
                                <FaPaperclip />
                                <span>{file.name || "Submitted file"}</span>
                                <small>{formatFileSize(file.size)}</small>
                              </a>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
          {pendingTasks.length ? pendingTasks.map((task) => (
            <button
              className="task-row"
              type="button"
              key={task.id}
              onClick={() => {
                setHighlightedProjectId(String(task.id));
                document.getElementById(getProjectElementId(task.id))?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }}
            >
              <FaTasks />
              <div><strong>{task.title}</strong><small>{task.due} - {task.priority}</small></div>
            </button>
          )) : (
            <p className="employee-project-empty">No pending tasks assigned yet.</p>
          )}
        </div>
      </section>
    </EmployeePortalLayout>
  );
}

export default EmployeeTasks;
