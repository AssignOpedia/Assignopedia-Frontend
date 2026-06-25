const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const parseApiResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Password reset request failed.");
  }

  return data;
};

export const requestPortalPasswordOtp = async ({ email, role }) => {
  const response = await fetch(`${apiBaseUrl}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, role }),
  });

  return parseApiResponse(response);
};

export const resetPortalPasswordWithOtp = async ({ resetId, email, role, otp, newPassword }) => {
  const response = await fetch(`${apiBaseUrl}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resetId, email, role, otp, newPassword }),
  });

  return parseApiResponse(response);
};
