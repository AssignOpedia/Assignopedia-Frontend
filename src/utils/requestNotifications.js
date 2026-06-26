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

export const formatNotificationDate = (date = new Date()) =>
  date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const addHrRequestNotification = ({ type, employeeName, requestDate, detail }) => {
  const notifications = hrStore.get();
  const notification = {
    id: `${type}-hr-${Date.now()}`,
    type,
    employeeName,
    detail,
    date: requestDate || formatNotificationDate(),
    message: `${employeeName} sent ${type} request on ${requestDate || formatNotificationDate()}.`,
  };

  hrStore.save([notification, ...notifications]).catch(() => {});
  return notification;
};

export const addEmployeeDecisionNotification = ({ type, employeeEmail, status, decisionDate, detail }) => {
  const notifications = employeeStore.get();
  const notification = {
    id: `${type}-employee-${Date.now()}`,
    type,
    employeeEmail,
    status,
    detail,
    date: decisionDate || formatNotificationDate(),
    message: `Your ${type} request was ${status.toLowerCase()} by HR on ${decisionDate || formatNotificationDate()}.`,
  };

  employeeStore.save([notification, ...notifications]).catch(() => {});
  return notification;
};

export const getHrRequestNotifications = () => hrStore.get();

export const getCurrentEmployeeNotifications = () => {
  const currentUser = getCurrentUser();

  return employeeStore.get().filter(
    (notification) => notification.employeeEmail === currentUser.email
  );
};

export { notificationEvent };
