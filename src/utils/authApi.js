const apiBaseUrl = import.meta.env.VITE_API_URL || "/api";

const request = async (path, body) => {
  let response;

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Backend API is not running. Start the Express server and try again.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Authentication request failed.");
  }

  return data;
};

export const registerAccountRemote = ({ name, email, password, role }) =>
  request("/auth/register", { name, email, password, role });

export const loginAccountRemote = ({ email, password, role }) =>
  request("/auth/login", { email, password, role });
