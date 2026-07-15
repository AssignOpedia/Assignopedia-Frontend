import { createApiResourceStore } from "./apiResourceStore";
import { getCurrentUser } from "./authStorage";

const passwordResetRequestEvent = "assignopedia-password-reset-request-updated";
const passwordResetStore = createApiResourceStore({
  resource: "passwordResetRequests",
  event: passwordResetRequestEvent,
  fallback: [],
});

export const getPasswordResetRequests = () => passwordResetStore.get();

const normalize = (value) => String(value || "").trim().toLowerCase();

const getReaderKey = (role = "") => {
  const currentUser = getCurrentUser();
  const readerRole = normalize(role || currentUser.role);
  const readerEmail = normalize(currentUser.email);

  return readerEmail ? `${readerRole}:${readerEmail}` : readerRole;
};

const isRequestReadBy = (request, role = "") => {
  const readerKey = getReaderKey(role);

  return Boolean(request.readBy?.[readerKey]);
};

export const getUnreadPasswordResetRequests = (role = "") =>
  getPasswordResetRequests().filter((request) => !isRequestReadBy(request, role));

export const markPasswordResetRequestsRead = async (role = "", requestIds = null) => {
  const requests = await passwordResetStore.load().catch(() => passwordResetStore.get());
  const selectedIds = Array.isArray(requestIds) ? new Set(requestIds) : null;
  const readerKey = getReaderKey(role);
  const readAt = new Date().toISOString();
  let changed = false;

  const nextRequests = (Array.isArray(requests) ? requests : []).map((request) => {
    if ((selectedIds && !selectedIds.has(request.id)) || request.readBy?.[readerKey]) {
      return request;
    }

    changed = true;
    return {
      ...request,
      readBy: {
        ...(request.readBy || {}),
        [readerKey]: readAt,
      },
      updatedAt: readAt,
    };
  });

  if (!changed) {
    return nextRequests;
  }

  return passwordResetStore.save(nextRequests);
};

export const addPasswordResetRequest = ({ name, email, role, otp }) => {
  const request = {
    id: `${Date.now()}-${email}`,
    name,
    email,
    role,
    otp,
    status: "Pending",
    requestedAt: new Date().toLocaleString(),
  };

  passwordResetStore.save([request, ...getPasswordResetRequests()]).catch(() => {});
  return request;
};

export { passwordResetRequestEvent };
