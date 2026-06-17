const passwordResetRequestsKey = "assignopediaPasswordResetRequests";

export const getPasswordResetRequests = () => {
  try {
    return JSON.parse(localStorage.getItem(passwordResetRequestsKey)) || [];
  } catch {
    return [];
  }
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
  const requests = [request, ...getPasswordResetRequests()];

  localStorage.setItem(passwordResetRequestsKey, JSON.stringify(requests));
  return request;
};
