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

export const setNotices = (notices) => {
  noticeStore.setLocal(Array.isArray(notices) ? notices : []);
};

export const createNotice = (title, body) => {
  const notices = noticeStore.get();
  const newNotice = {
    id: `${Date.now()}-${Math.random()}`,
    title,
    body,
    date: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  };

  noticeStore.save([newNotice, ...notices]).catch(() => {});
  return newNotice;
};

export const getNotices = () => noticeStore.get();

export const deleteNotice = (id) => {
  noticeStore.save(getNotices().filter((notice) => notice.id !== id)).catch(() => {});
};

export const getNoticeEvent = () => noticeEvent;
