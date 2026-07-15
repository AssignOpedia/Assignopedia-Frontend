import { createApiResourceStore } from "./apiResourceStore";
import { getCurrentUser } from "./authStorage";

export const adminNotificationEvent = "assignopedia-admin-notification-updated";

const adminNotificationStore = createApiResourceStore({
  resource: "adminNotifications",
  event: adminNotificationEvent,
  fallback: [],
});

const getNotificationTimestamp = (notification) => {
  const value = notification.createdAt || notification.submittedAt || notification.updatedAt;

  if (value) {
    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return date.getTime();
    }
  }

  return 0;
};

const sortNewestFirst = (notifications) =>
  [...notifications].sort((a, b) => getNotificationTimestamp(b) - getNotificationTimestamp(a));

const normalize = (value) => String(value || "").trim().toLowerCase();

const getAdminReaderKey = () => {
  const currentUser = getCurrentUser();
  const email = normalize(currentUser.email);

  return email ? `admin:${email}` : "admin";
};

const isReadByCurrentAdmin = (notification) => {
  const readerKey = getAdminReaderKey();

  return Boolean(notification.readAt || notification.readBy?.[readerKey]);
};

export const getAdminNotifications = () => sortNewestFirst(adminNotificationStore.get());

export const getUnreadAdminNotifications = () =>
  getAdminNotifications().filter((notification) => !isReadByCurrentAdmin(notification));

export const loadAdminNotifications = async () => {
  const notifications = await adminNotificationStore.load();
  return sortNewestFirst(Array.isArray(notifications) ? notifications : []);
};

export const setAdminNotifications = (notifications) =>
  adminNotificationStore.setLocal(sortNewestFirst(Array.isArray(notifications) ? notifications : []));

export const markAdminNotificationsRead = async (notificationIds = null) => {
  const notifications = await adminNotificationStore.load().catch(() => adminNotificationStore.get());
  const selectedIds = Array.isArray(notificationIds) ? new Set(notificationIds) : null;
  const readerKey = getAdminReaderKey();
  const readAt = new Date().toISOString();
  let changed = false;

  const nextNotifications = (Array.isArray(notifications) ? notifications : []).map((notification) => {
    if ((selectedIds && !selectedIds.has(notification.id)) || notification.readAt || notification.readBy?.[readerKey]) {
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
    return sortNewestFirst(nextNotifications);
  }

  const savedNotifications = await adminNotificationStore.save(sortNewestFirst(nextNotifications));
  return sortNewestFirst(savedNotifications);
};
