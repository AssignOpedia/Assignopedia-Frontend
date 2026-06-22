const noticeStorageKey = "assignopediaNotices";
const noticeEvent = "assignopedia-notice-updated";

const readNotices = () => {
  try {
    return JSON.parse(localStorage.getItem(noticeStorageKey)) || [];
  } catch {
    return [];
  }
};

const saveNotices = (notices) => {
  localStorage.setItem(noticeStorageKey, JSON.stringify(notices));
  window.dispatchEvent(new CustomEvent(noticeEvent));
};

export const createNotice = (title, body) => {
  const notices = readNotices();
  const newNotice = {
    id: `${Date.now()}-${Math.random()}`,
    title,
    body,
    date: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  };

  notices.unshift(newNotice);
  saveNotices(notices);
  return newNotice;
};

export const getNotices = () => {
  return readNotices();
};

export const deleteNotice = (id) => {
  const notices = readNotices();
  const filtered = notices.filter((notice) => notice.id !== id);
  saveNotices(filtered);
};

export const getNoticeEvent = () => noticeEvent;

export const getDefaultNotices = () => [
  { id: "default-1", title: "Updated holiday calendar is available for review.", date: "Jun 16", body: "The revised annual holiday list is now available." },
  { id: "default-2", title: "June payroll inputs close on Friday at 5 PM.", date: "Jun 18", body: "Submit payroll inputs before Friday 5 PM." },
  { id: "default-3", title: "WFH approval SLA revised to one working day.", date: "Jun 20", body: "WFH requests will be reviewed within one working day." },
];
