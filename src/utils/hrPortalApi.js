const apiBaseUrl = import.meta.env.VITE_API_URL || "/api";

export const getApiBaseUrl = () => apiBaseUrl;

const parseResponse = async (response, fallbackMessage) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
};

const requestJson = async (path, options = {}) => {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  return parseResponse(response, "HR portal request failed.");
};

export const getLeaveRequestsRemote = () => requestJson("/leave-requests");

export const getLeaveRequestRemote = (id) => requestJson(`/leave-requests/${id}`);

export const getLeaveRequestDocumentUrl = (id, { download = false } = {}) =>
  `${apiBaseUrl}/leave-requests/${encodeURIComponent(id)}/document${download ? "?download=true" : ""}`;

export const createLeaveRequestRemote = (request) =>
  requestJson("/leave-requests", {
    method: "POST",
    body: JSON.stringify(request),
  });

export const decideLeaveRequestRemote = (id, status) =>
  requestJson(`/leave-requests/${id}/decision`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const getWfhRequestsRemote = () => requestJson("/wfh-requests");

export const createWfhRequestRemote = (request) =>
  requestJson("/wfh-requests", {
    method: "POST",
    body: JSON.stringify(request),
  });

export const decideWfhRequestRemote = (id, status) =>
  requestJson(`/wfh-requests/${id}/decision`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const getAttendanceRemote = () => requestJson("/attendance");

export const syncAttendanceRemote = (records) =>
  requestJson("/sync/attendance", {
    method: "PUT",
    body: JSON.stringify(records),
  });

export const getNoticesRemote = () => requestJson("/notices");

export const createNoticeRemote = (notice) =>
  requestJson("/notices", {
    method: "POST",
    body: JSON.stringify(notice),
  });

export const deleteNoticeRemote = (id) =>
  requestJson(`/notices/${id}`, {
    method: "DELETE",
  });
