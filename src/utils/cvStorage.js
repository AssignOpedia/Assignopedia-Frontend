const cvStorageKey = "assignopediaCVApplications";
const cvEvent = "assignopedia-cv-updated";

const readCVs = () => {
  try {
    return JSON.parse(localStorage.getItem(cvStorageKey)) || [];
  } catch {
    return [];
  }
};

const saveCVs = (cvs) => {
  localStorage.setItem(cvStorageKey, JSON.stringify(cvs));
  window.dispatchEvent(new CustomEvent(cvEvent));
};

export const submitCareerApplication = (applicationData) => {
  const cvs = readCVs();
  const newApplication = {
    id: `${Date.now()}-${Math.random()}`,
    ...applicationData,
    submittedAt: new Date().toISOString(),
    date: new Date().toLocaleDateString(),
  };

  cvs.push(newApplication);
  saveCVs(cvs);
  return newApplication;
};

export const getStoredCVs = () => {
  return readCVs();
};

export const getCVById = (id) => {
  const cvs = readCVs();
  return cvs.find((cv) => cv.id === id);
};

export const deleteCVApplication = (id) => {
  const cvs = readCVs();
  const filtered = cvs.filter((cv) => cv.id !== id);
  saveCVs(filtered);
};

export const updateCVApplicationStatus = (id, status) => {
  const cvs = readCVs();
  const updatedCVs = cvs.map((cv) =>
    cv.id === id ? { ...cv, status, reviewedAt: new Date().toISOString() } : cv
  );

  saveCVs(updatedCVs);
  return updatedCVs.find((cv) => cv.id === id) || null;
};

export const getCVEvent = () => cvEvent;
