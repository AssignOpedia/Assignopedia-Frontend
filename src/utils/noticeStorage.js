import { createApiResourceStore } from "./apiResourceStore";

const noticeEvent = "assignopedia-notice-updated";

export const getDefaultNotices = () => [
  { id: "default-1", title: "Updated holiday calendar is available for review.", date: "Jun 16", body: "The revised annual holiday list is now available." },
  { id: "default-2", title: "June payroll inputs close on Friday at 5 PM.", date: "Jun 18", body: "Submit payroll inputs before Friday 5 PM." },
  { id: "default-3", title: "WFH approval SLA revised to one working day.", date: "Jun 20", body: "WFH requests will be reviewed within one working day." },
];

const noticeStore = createApiResourceStore({
  resource: "notices",
  event: noticeEvent,
  fallback: getDefaultNotices(),
});

export const getNoticeDateTime = (notice = {}) => {
  const timestampFromId = Number(String(notice.id || "").split("-")[0]);
  const sourceDate = notice.createdAt || (Number.isFinite(timestampFromId) ? timestampFromId : "");

  if (sourceDate) {
    const date = new Date(sourceDate);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }

  return [notice.date, notice.time].filter(Boolean).join(" - ");
};

export const setNotices = (notices) => {
  noticeStore.setLocal(Array.isArray(notices) ? notices : []);
};

export const createNotice = (title, body) => {
  const notices = noticeStore.get();
  const createdAt = new Date().toISOString();
  const newNotice = {
    id: `${Date.now()}-${Math.random()}`,
    title,
    body,
    createdAt,
    date: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    time: new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  noticeStore.save([newNotice, ...notices]).catch(() => {});
  return newNotice;
};

export const getNotices = () => noticeStore.get();

export const getEmployeeNotices = () =>
  getNotices().filter((notice) => !String(notice.id || "").startsWith("default-"));

export const deleteNotice = (id) => {
  noticeStore.save(getNotices().filter((notice) => notice.id !== id)).catch(() => {});
};

export const getNoticeEvent = () => noticeEvent;
