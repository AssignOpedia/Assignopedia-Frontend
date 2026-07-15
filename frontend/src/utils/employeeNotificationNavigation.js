const employeeProjectTargetKey = "assignopedia-employee-project-target";
const employeeRequestTargetKey = "assignopedia-employee-request-target";

const normalize = (value) => String(value || "").trim().toLowerCase();

const getPageFromActionUrl = (actionUrl = "") => {
  if (!actionUrl) {
    return "";
  }

  try {
    const url = new URL(actionUrl, window.location.origin);
    const page = url.pathname.replace(/^\/+|\/+$/g, "");

    if (page === "employee-tasks" && url.searchParams.get("projectId")) {
      window.localStorage.setItem(
        employeeProjectTargetKey,
        JSON.stringify({ projectId: url.searchParams.get("projectId") })
      );
    }

    if (page === "employee-leave-wfh" && url.searchParams.get("requestId")) {
      window.localStorage.setItem(
        employeeRequestTargetKey,
        JSON.stringify({
          requestId: url.searchParams.get("requestId"),
          type: url.searchParams.get("type") || "",
        })
      );
    }

    return page;
  } catch {
    return "";
  }
};

export const getEmployeeProjectTargetKey = () => employeeProjectTargetKey;

export const getEmployeeRequestTargetKey = () => employeeRequestTargetKey;

export const navigateFromEmployeeNotification = (notification, onNavigate) => {
  const type = normalize(notification.type);
  const relatedRecordType = normalize(notification.relatedRecordType);
  const targetPage = notification.targetPage || getPageFromActionUrl(notification.actionUrl);

  if (relatedRecordType === "project" || type.includes("project")) {
    const projectId = notification.relatedRecordId || notification.projectId || "";

    if (projectId) {
      window.localStorage.setItem(employeeProjectTargetKey, JSON.stringify({ projectId }));
    }

    onNavigate(targetPage || "employee-tasks");
    return;
  }

  if (relatedRecordType.includes("leave") || relatedRecordType.includes("wfh") || type.includes("leave") || type.includes("wfh")) {
    const requestId = notification.relatedRecordId || notification.requestId || "";
    const requestType = relatedRecordType.includes("wfh") || type.includes("wfh") ? "wfh" : "leave";

    if (requestId) {
      window.localStorage.setItem(
        employeeRequestTargetKey,
        JSON.stringify({ requestId, type: requestType })
      );
    }

    onNavigate(targetPage || "employee-leave-wfh");
    return;
  }

  onNavigate(targetPage || "employee-notifications");
};
