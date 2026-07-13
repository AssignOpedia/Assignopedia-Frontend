import { createApiResourceStore } from "./apiResourceStore";
import { getCurrentUser } from "./authStorage";

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

const noticeReadStore = createApiResourceStore({
  resource: "noticeReadReceipts",
  event: noticeEvent,
  fallback: [],
});

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

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

export const loadEmployeeNotices = async () => {
  await Promise.all([
    noticeStore.load().catch(() => noticeStore.get()),
    noticeReadStore.load().catch(() => noticeReadStore.get()),
  ]);

  return getEmployeeNotices();
};

export const getCurrentEmployeeUnreadNotices = () => {
  const currentEmail = normalizeEmail(getCurrentUser().email);
  const readNoticeIds = new Set(
    noticeReadStore
      .get()
      .filter((receipt) => normalizeEmail(receipt.employeeEmail) === currentEmail)
      .map((receipt) => receipt.noticeId)
  );

  return getEmployeeNotices().filter((notice) => !readNoticeIds.has(notice.id));
};

export const markCurrentEmployeeNoticesRead = async (noticeIds = null) => {
  const currentEmail = normalizeEmail(getCurrentUser().email);
  const selectedIds = Array.isArray(noticeIds) ? new Set(noticeIds) : null;
  const readAt = new Date().toISOString();
  const targetNotices = getEmployeeNotices().filter((notice) => !selectedIds || selectedIds.has(notice.id));

  if (targetNotices.length === 0) {
    return getEmployeeNotices();
  }

  const existingReceipts = await noticeReadStore.load().catch(() => noticeReadStore.get());
  const receiptKeys = new Set(
    (Array.isArray(existingReceipts) ? existingReceipts : []).map(
      (receipt) => `${normalizeEmail(receipt.employeeEmail)}:${receipt.noticeId}`
    )
  );
  const nextReceipts = [...(Array.isArray(existingReceipts) ? existingReceipts : [])];

  targetNotices.forEach((notice) => {
    const key = `${currentEmail}:${notice.id}`;

    if (!receiptKeys.has(key)) {
      nextReceipts.push({
        id: `${notice.id}-${currentEmail}`,
        noticeId: notice.id,
        employeeEmail: currentEmail,
        readAt,
      });
      receiptKeys.add(key);
    }
  });

  await noticeReadStore.save(nextReceipts);
  return getEmployeeNotices();
};

export const deleteNotice = (id) => {
  noticeStore.save(getNotices().filter((notice) => notice.id !== id)).catch(() => {});
};

export const getNoticeEvent = () => noticeEvent;
