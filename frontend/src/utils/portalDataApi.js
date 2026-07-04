const apiBaseUrl = import.meta.env.VITE_API_URL || "/api";

export const getPortalResource = async (resource, fallback = null) => {
  try {
    const response = await fetch(`${apiBaseUrl}/sync/${resource}`);

    if (!response.ok) {
      return fallback;
    }

    const data = await response.json();
    return data ?? fallback;
  } catch {
    return fallback;
  }
};

export const savePortalResource = async (resource, data) => {
  const response = await fetch(`${apiBaseUrl}/sync/${resource}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Could not save ${resource}.`);
  }

  return response.json();
};
