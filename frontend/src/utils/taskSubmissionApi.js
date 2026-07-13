import { uploadFileToCloudinary } from "./uploadApi";

const apiBaseUrl = import.meta.env.VITE_API_URL || "/api";

export const loadTaskSubmissions = async () => {
  const response = await fetch(`${apiBaseUrl}/task-submissions`);

  if (!response.ok) {
    throw new Error("Could not load task submissions.");
  }

  return response.json();
};

export const submitCompletedTaskFiles = async ({ project, assignment, employee, files, comment = "" }) => {
  if (!project?.id) {
    throw new Error("Project details are missing.");
  }

  if (!employee?.email) {
    throw new Error("Employee email is missing.");
  }

  if (!Array.isArray(files) || files.length === 0) {
    throw new Error("Please select at least one completed work file.");
  }

  const uploadedFiles = [];

  for (const file of files) {
    const upload = await uploadFileToCloudinary(file, {
      folder: `assignopedia/task-submissions/${project.id}`,
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

  const submittedAt = new Date().toISOString();
  const response = await fetch(`${apiBaseUrl}/task-submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectId: project.id,
      projectTitle: project.title || project.name || "Untitled Project",
      employeeName: employee.name || assignment?.name || "Employee",
      employeeEmail: String(employee.email || "").trim().toLowerCase(),
      allocatedWordCount: Number(assignment?.wordCount || 0),
      comment: String(comment || "").trim(),
      files: uploadedFiles,
      fileCount: uploadedFiles.length,
      status: "Completed",
      submittedAt,
      createdAt: submittedAt,
    }),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Could not save task submission.");
  }

  return data;
};
