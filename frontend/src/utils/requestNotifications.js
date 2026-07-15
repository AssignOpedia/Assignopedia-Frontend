import { getCurrentUser } from "./authStorage";
import { createApiResourceStore } from "./apiResourceStore";

const notificationEvent = "assignopedia-request-notification-updated";

const hrStore = createApiResourceStore({
  resource: "hrNotifications",
  event: notificationEvent,
  fallback: [],
});

const employeeStore = createApiResourceStore({
  resource: "employeeNotifications",
  event: notificationEvent,
  fallback: [],
});

const projectStore = createApiResourceStore({
  resource: "projects",
  event: notificationEvent,
  fallback: [],
});

export const formatNotificationDate = (date = new Date()) =>
  date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const formatNotificationDateTime = (date = new Date()) =>
  date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const getNotificationTimestamp = (notification) => {
  const value = notification.createdAt || notification.allocatedAt || notification.updatedAt;

  if (value) {
    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return date.getTime();
    }
  }

  const idTimestamp = String(notification.id || "").match(/-(\d{10,})/);

  return idTimestamp ? Number(idTimestamp[1]) : 0;
};

const sortNotificationsNewestFirst = (notifications) =>
  [...notifications].sort((a, b) => getNotificationTimestamp(b) - getNotificationTimestamp(a));

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const getProjectNotificationKey = (notification) =>
  notification.projectId ? `${notification.projectId}:${normalizeEmail(notification.employeeEmail)}` : "";

export const isNotificationUnread = (notification) => !notification.readAt;

const getHrReaderKey = () => {
  const currentUser = getCurrentUser();
  const currentEmail = normalizeEmail(currentUser.email);

  return currentEmail ? `hr:${currentEmail}` : "hr";
};

const isCurrentHrNotificationUnread = (notification) => {
  const currentEmail = normalizeEmail(getCurrentUser().email);
  const notificationHrEmail = normalizeEmail(notification.hrEmail);
  const readerKey = getHrReaderKey();

  if (notificationHrEmail && notificationHrEmail === currentEmail) {
    return !notification.readAt && !notification.readBy?.[readerKey];
  }

  return !notification.readBy?.[readerKey] && !notification.readAt;
};

export const addHrRequestNotification = ({ type, employeeName, requestDate, detail }) => {
  const notifications = hrStore.get();
  const createdAt = new Date().toISOString();
  const displayDate = requestDate || formatNotificationDateTime(new Date(createdAt));
  const notification = {
    id: `${type}-hr-${Date.now()}`,
    type,
    employeeName,
    detail,
    date: displayDate,
    createdAt,
    message: `${employeeName} sent ${type} request on ${displayDate}.`,
  };

  hrStore.save(sortNotificationsNewestFirst([notification, ...notifications])).catch(() => {});
  return notification;
};

export const addEmployeeDecisionNotification = ({ type, employeeEmail, status, decisionDate, detail }) => {
  const notifications = employeeStore.get();
  const createdAt = new Date().toISOString();
  const displayDate = decisionDate || formatNotificationDateTime(new Date(createdAt));
  const notification = {
    id: `${type}-employee-${Date.now()}`,
    type,
    employeeEmail,
    status,
    detail,
    date: displayDate,
    createdAt,
    relatedRecordType: type === "WFH" ? "wfh-request" : "leave-request",
    targetPage: "employee-leave-wfh",
    actionUrl: "/employee-leave-wfh",
    message: `Your ${type} request was ${status.toLowerCase()} by HR on ${displayDate}.`,
  };

  employeeStore.save(sortNotificationsNewestFirst([notification, ...notifications])).catch(() => {});
  return notification;
};

export const addEmployeeProjectNotifications = async ({ projectId, projectTitle, assignments = [], allocatedAt, totalWordCount }) => {
  const existingNotifications = await employeeStore.load().catch(() => employeeStore.get());
  const createdAt = allocatedAt || new Date().toISOString();
  const date = formatNotificationDateTime(new Date(createdAt));
  const notifications = assignments.map((assignment) => ({
    id: `project-assignment-${assignment.email}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: "Project Assignment",
    projectId,
    relatedRecordId: projectId,
    relatedRecordType: "project",
    targetPage: "employee-tasks",
    actionUrl: `/employee-tasks?projectId=${encodeURIComponent(projectId || "")}`,
    employeeEmail: assignment.email,
    status: "Assigned",
    detail: `${projectTitle} | Your words: ${Number(assignment.wordCount || 0).toLocaleString("en-IN")} | Total words: ${Number(totalWordCount || 0).toLocaleString("en-IN")}`,
    date,
    allocatedAt: createdAt,
    createdAt,
    message: `New project assigned: ${projectTitle}. Your word count is ${Number(assignment.wordCount || 0).toLocaleString("en-IN")}.`,
  }));

  if (notifications.length > 0) {
    await employeeStore.save(sortNotificationsNewestFirst([...notifications, ...(Array.isArray(existingNotifications) ? existingNotifications : [])]));
  }

  return notifications;
};

export const getHrRequestNotifications = () => hrStore.get();

export const getCurrentHrNotifications = () => {
  const currentUser = getCurrentUser();
  const currentEmail = normalizeEmail(currentUser.email);

  return sortNotificationsNewestFirst(
    hrStore.get().filter((notification) => {
      const notificationHrEmail = normalizeEmail(notification.hrEmail);
      const notificationEmployeeEmail = normalizeEmail(notification.employeeEmail);

      if (notificationHrEmail) {
        return notificationHrEmail === currentEmail;
      }

      return !notificationEmployeeEmail;
    })
  );
};

export const loadCurrentHrNotifications = async () => {
  await hrStore.load().catch(() => hrStore.get());
  return getCurrentHrNotifications();
};

export const getCurrentHrUnreadNotifications = () =>
  getCurrentHrNotifications().filter(isCurrentHrNotificationUnread);

export const markCurrentHrNotificationsRead = async (notificationIds = null) => {
  const notifications = await hrStore.load().catch(() => hrStore.get());
  const selectedIds = Array.isArray(notificationIds) ? new Set(notificationIds) : null;
  const visibleIds = new Set(getCurrentHrNotifications().map((notification) => notification.id));
  const readerKey = getHrReaderKey();
  const readAt = new Date().toISOString();
  let changed = false;

  const nextNotifications = (Array.isArray(notifications) ? notifications : []).map((notification) => {
    if (!visibleIds.has(notification.id) || (selectedIds && !selectedIds.has(notification.id))) {
      return notification;
    }

    if (!isCurrentHrNotificationUnread(notification)) {
      return notification;
    }

    changed = true;
    return {
      ...notification,
      readBy: {
        ...(notification.readBy || {}),
        [readerKey]: readAt,
      },
      updatedAt: readAt,
    };
  });

  if (!changed) {
    return getCurrentHrNotifications();
  }

  await hrStore.save(sortNotificationsNewestFirst(nextNotifications));
  return getCurrentHrNotifications();
};

export const loadEmployeeNotifications = async () => {
  await Promise.all([
    employeeStore.load().catch(() => employeeStore.get()),
    projectStore.load().catch(() => projectStore.get()),
  ]);

  return getCurrentEmployeeNotifications();
};

export const loadHrRequestNotifications = async () => hrStore.load();

export const getCurrentEmployeeNotifications = () => {
  const currentUser = getCurrentUser();
  const currentEmail = normalizeEmail(currentUser.email);
  const savedNotifications = employeeStore.get().filter(
    (notification) => normalizeEmail(notification.employeeEmail) === currentEmail
  );
  const savedProjectNotificationKeys = new Set(
    savedNotifications
      .filter((notification) => notification.type === "Project Assignment" && notification.projectId)
      .map(getProjectNotificationKey)
  );
  const projectNotifications = projectStore.get().flatMap((project) => {
    const assignments = Array.isArray(project.assignments) ? project.assignments : [];
    const assignment = assignments.find((item) => normalizeEmail(item.email) === currentEmail);

    if (!assignment) {
      return [];
    }

    const projectId = project.id || project.title || project.name;
    const key = `${projectId}:${currentEmail}`;

    if (savedProjectNotificationKeys.has(key)) {
      return [];
    }

    const allocatedAt = assignment.allocatedAt || project.createdAt || project.updatedAt || "";
    const date = allocatedAt ? formatNotificationDateTime(new Date(allocatedAt)) : formatNotificationDateTime();
    const projectTitle = project.title || project.name || "Assigned Project";

    return [{
      id: `project-assignment-derived-${projectId}-${currentEmail}`,
      type: "Project Assignment",
      projectId,
      relatedRecordId: projectId,
      relatedRecordType: "project",
      targetPage: "employee-tasks",
      actionUrl: `/employee-tasks?projectId=${encodeURIComponent(projectId || "")}`,
      employeeEmail: currentEmail,
      status: "Assigned",
      detail: `${projectTitle} | Your words: ${Number(assignment.wordCount || 0).toLocaleString("en-IN")} | Total words: ${Number(project.totalWordCount || 0).toLocaleString("en-IN")}`,
      date,
      allocatedAt,
      createdAt: allocatedAt,
      message: `New project assigned: ${projectTitle}. Your word count is ${Number(assignment.wordCount || 0).toLocaleString("en-IN")}.`,
    }];
  });

  return sortNotificationsNewestFirst([...savedNotifications, ...projectNotifications]);
};

export const getCurrentEmployeeUnreadNotifications = () =>
  getCurrentEmployeeNotifications().filter(isNotificationUnread);

export const markCurrentEmployeeNotificationsRead = async (notificationIds = null) => {
  const currentUser = getCurrentUser();
  const currentEmail = normalizeEmail(currentUser.email);
  const selectedIds = Array.isArray(notificationIds) ? new Set(notificationIds) : null;
  const readAt = new Date().toISOString();
  const currentNotifications = getCurrentEmployeeNotifications();
  const targetNotifications = currentNotifications.filter(
    (notification) => !notification.readAt && (!selectedIds || selectedIds.has(notification.id))
  );

  if (targetNotifications.length === 0) {
    return currentNotifications;
  }

  const targetIds = new Set(targetNotifications.map((notification) => notification.id));
  const targetProjectKeys = new Set(
    targetNotifications
      .filter((notification) => notification.projectId)
      .map((notification) => `${notification.projectId}:${normalizeEmail(notification.employeeEmail || currentEmail)}`)
  );
  const existingNotifications = await employeeStore.load().catch(() => employeeStore.get());
  const nextNotifications = [];
  const savedIds = new Set();
  const savedProjectKeys = new Set();

  (Array.isArray(existingNotifications) ? existingNotifications : []).forEach((notification) => {
    const notificationEmail = normalizeEmail(notification.employeeEmail);
    const projectKey = getProjectNotificationKey(notification);
    const shouldMarkRead =
      notificationEmail === currentEmail &&
      (targetIds.has(notification.id) || (projectKey && targetProjectKeys.has(projectKey)));
    const nextNotification = shouldMarkRead
      ? { ...notification, readAt, updatedAt: readAt }
      : notification;

    nextNotifications.push(nextNotification);
    savedIds.add(notification.id);

    if (projectKey) {
      savedProjectKeys.add(projectKey);
    }
  });

  targetNotifications.forEach((notification) => {
    const notificationEmail = normalizeEmail(notification.employeeEmail || currentEmail);
    const projectKey = notification.projectId ? `${notification.projectId}:${notificationEmail}` : "";

    if (savedIds.has(notification.id) || (projectKey && savedProjectKeys.has(projectKey))) {
      return;
    }

    nextNotifications.unshift({
      ...notification,
      employeeEmail: notification.employeeEmail || currentEmail,
      readAt,
      updatedAt: readAt,
    });
    savedIds.add(notification.id);

    if (projectKey) {
      savedProjectKeys.add(projectKey);
    }
  });

  await employeeStore.save(sortNotificationsNewestFirst(nextNotifications));
  return getCurrentEmployeeNotifications();
};

export { notificationEvent };
