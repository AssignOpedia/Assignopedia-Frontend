const apiBaseUrl = import.meta.env.VITE_API_URL || "/api";

const syncItems = [
  { key: "assignopediaAccounts", resource: "accounts", event: "assignopedia-current-user-updated" },
  { key: "assignopediaAttendanceRecords", resource: "attendance", event: "assignopedia-attendance-updated" },
  { key: "assignopediaBlogPosts", resource: "blogPosts", event: "assignopedia-blog-posts-updated" },
  { key: "assignopediaCVApplications", resource: "cvApplications", event: "assignopedia-cv-updated" },
  { key: "assignopediaEmployeeNotifications", resource: "employeeNotifications", event: "assignopedia-request-notification-updated" },
  { key: "assignopediaEmployeeTeam", resource: "team", event: "assignopedia-team-updated" },
  { key: "assignopediaEmployees", resource: "employees", event: "assignopedia-employee-updated" },
  { key: "assignopediaHrNotifications", resource: "hrNotifications", event: "assignopedia-request-notification-updated" },
  { key: "assignopediaNotices", resource: "notices", event: "assignopedia-notice-updated" },
  { key: "assignopediaOrganization", resource: "departments", event: "assignopedia-organization-updated" },
  { key: "assignopediaPasswordResetRequests", resource: "passwordResetRequests", event: "assignopedia-password-reset-request-updated" },
  { key: "assignopediaPortalProfiles", resource: "profiles", event: "assignopedia-profile-updated" },
  { key: "employeeWfhRequests", resource: "wfhRequests", event: "employee-wfh-request-updated" },
  { key: "hrLeaveRequests", resource: "leaveRequests", event: "hr-leave-request-updated" },
];

const readLocalJson = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
};

const writeRemote = async (resource, data) => {
  await fetch(`${apiBaseUrl}/sync/${resource}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data ?? null),
  });
};

const readRemote = async (resource) => {
  const response = await fetch(`${apiBaseUrl}/sync/${resource}`);

  if (!response.ok) {
    throw new Error(`Backend sync failed for ${resource}`);
  }

  return response.json();
};

const syncToBackend = async (item) => {
  const data = readLocalJson(item.key);

  if (data !== null) {
    await writeRemote(item.resource, data);
  }
};

const hasData = (data) => {
  if (Array.isArray(data)) {
    return data.length > 0;
  }

  return data !== null && typeof data === "object" && Object.keys(data).length > 0;
};

const initialSync = async (item) => {
  const localData = readLocalJson(item.key);
  const remoteData = await readRemote(item.resource);

  if (!hasData(remoteData) && hasData(localData)) {
    await writeRemote(item.resource, localData);
    return;
  }

  localStorage.setItem(item.key, JSON.stringify(remoteData));
  window.dispatchEvent(new CustomEvent(item.event, { detail: remoteData }));
};

export const startBackendSync = () => {
  if (typeof window === "undefined" || window.__assignopediaBackendSyncStarted) {
    return;
  }

  window.__assignopediaBackendSyncStarted = true;
  const debounceTimers = new Map();

  syncItems.forEach((item) => {
    initialSync(item).catch(() => {});

    window.addEventListener(item.event, () => {
      window.clearTimeout(debounceTimers.get(item.key));
      debounceTimers.set(
        item.key,
        window.setTimeout(() => {
          syncToBackend(item).catch(() => {});
        }, 350)
      );
    });
  });
};
