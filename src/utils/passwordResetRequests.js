import { createApiResourceStore } from "./apiResourceStore";

const passwordResetRequestEvent = "assignopedia-password-reset-request-updated";
const passwordResetStore = createApiResourceStore({
  resource: "passwordResetRequests",
  event: passwordResetRequestEvent,
  fallback: [],
});

export const getPasswordResetRequests = () => passwordResetStore.get();

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
