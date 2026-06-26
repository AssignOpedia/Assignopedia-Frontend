const apiBaseUrl = import.meta.env.VITE_API_URL || "/api";

const syncItems = [
  { resource: "accounts", event: "assignopedia-current-user-updated" },
  { resource: "attendance", event: "assignopedia-attendance-updated" },
  { resource: "blogPosts", event: "assignopedia-blog-posts-updated" },
  { resource: "cvApplications", event: "assignopedia-cv-updated" },
  { resource: "employeeNotifications", event: "assignopedia-request-notification-updated" },
  { resource: "team", event: "assignopedia-team-updated" },
  { resource: "employees", event: "assignopedia-employee-updated" },
  { resource: "hrNotifications", event: "assignopedia-request-notification-updated" },
  { resource: "notices", event: "assignopedia-notice-updated" },
  { resource: "departments", event: "assignopedia-organization-updated" },
  { resource: "passwordResetRequests", event: "assignopedia-password-reset-request-updated" },
  { resource: "profiles", event: "assignopedia-profile-updated" },
  { resource: "projects", event: "assignopedia-projects-updated" },
];

const readRemote = async (resource) => {
  const response = await fetch(`${apiBaseUrl}/sync/${resource}`);

  if (!response.ok) {
    throw new Error(`Backend sync failed for ${resource}`);
  }

  return response.json();
};

export const startBackendSync = () => {
  if (typeof window === "undefined" || window.__assignopediaBackendSyncStarted) {
    return;
  }

  window.__assignopediaBackendSyncStarted = true;

  syncItems.forEach((item) => {
    readRemote(item.resource)
      .then((remoteData) => {
        window.dispatchEvent(new CustomEvent(item.event, { detail: remoteData }));
      })
      .catch(() => {});
  });
};
