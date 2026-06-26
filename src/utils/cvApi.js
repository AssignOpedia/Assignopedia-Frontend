const apiBaseUrl = import.meta.env.VITE_API_URL || "/api";

export const getCVApplicationDocumentUrl = (id, { download = false } = {}) =>
  `${apiBaseUrl}/cv-applications/${encodeURIComponent(id)}/document${download ? "?download=true" : ""}`;

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "CV application request failed.");
  }

  return data;
};

export const submitCareerApplicationRemote = async (application) => {
  const response = await fetch(`${apiBaseUrl}/career-submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(application),
  });

  return parseResponse(response);
};

export const getCVApplicationsRemote = async () => {
  const response = await fetch(`${apiBaseUrl}/cv-applications`);

  return parseResponse(response);
};

export const updateCVApplicationRemote = async (application) => {
  const response = await fetch(`${apiBaseUrl}/cv-applications/${application.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(application),
  });

  return parseResponse(response);
};

export const deleteCVApplicationRemote = async (id) => {
  const response = await fetch(`${apiBaseUrl}/cv-applications/${id}`, {
    method: "DELETE",
  });

  return parseResponse(response);
};
