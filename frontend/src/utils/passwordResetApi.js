const apiBaseUrl = import.meta.env.VITE_API_URL || "/api";

const parseApiResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Password reset request failed.");
  }

  return data;
};

export const requestPortalPasswordOtp = async ({ email, role }) => {
  let response;

  try {
    response = await fetch(`${apiBaseUrl}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
  } catch {
    throw new Error("Backend API is not running. Start the Express server and try again.");
  }

  return parseApiResponse(response);
};

export const resetPortalPasswordWithOtp = async ({ resetId, email, role, otp, newPassword }) => {
  let response;

  try {
    response = await fetch(`${apiBaseUrl}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resetId, email, role, otp, newPassword }),
    });
  } catch {
    throw new Error("Backend API is not running. Start the Express server and try again.");
  }

  return parseApiResponse(response);
};
