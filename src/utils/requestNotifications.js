import { getCurrentUser } from "./authStorage";

const hrNotificationKey = "assignopediaHrNotifications";
const employeeNotificationKey = "assignopediaEmployeeNotifications";
const notificationEvent = "assignopedia-request-notification-updated";

export const formatNotificationDate = (date = new Date()) =>
  date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const readNotifications = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

const saveNotifications = (key, notifications) => {
  localStorage.setItem(key, JSON.stringify(notifications));
  window.dispatchEvent(new CustomEvent(notificationEvent));
};

export const addHrRequestNotification = ({ type, employeeName, requestDate, detail }) => {
  const notifications = readNotifications(hrNotificationKey);
  const notification = {
    id: `${type}-hr-${Date.now()}`,
    type,
    employeeName,
    detail,
    date: requestDate || formatNotificationDate(),
    message: `${employeeName} sent ${type} request on ${requestDate || formatNotificationDate()}.`,
  };

  saveNotifications(hrNotificationKey, [notification, ...notifications]);
  return notification;
};

export const addEmployeeDecisionNotification = ({ type, employeeEmail, status, decisionDate, detail }) => {
  const notifications = readNotifications(employeeNotificationKey);
  const notification = {
    id: `${type}-employee-${Date.now()}`,
    type,
    employeeEmail,
    status,
    detail,
    date: decisionDate || formatNotificationDate(),
    message: `Your ${type} request was ${status.toLowerCase()} by HR on ${decisionDate || formatNotificationDate()}.`,
  };

  saveNotifications(employeeNotificationKey, [notification, ...notifications]);
  return notification;
};

export const getHrRequestNotifications = () => readNotifications(hrNotificationKey);

export const getCurrentEmployeeNotifications = () => {
  const currentUser = getCurrentUser();

  return readNotifications(employeeNotificationKey).filter(
    (notification) => notification.employeeEmail === currentUser.email
  );
};

export { notificationEvent };
