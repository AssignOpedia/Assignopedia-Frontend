import { createApiResourceStore } from "./apiResourceStore";

const cvEvent = "assignopedia-cv-updated";
const cvStore = createApiResourceStore({
  resource: "cvApplications",
  event: cvEvent,
  fallback: [],
});

const readCVs = () => cvStore.get();

const saveCVs = (cvs) => {
  cvStore.save(Array.isArray(cvs) ? cvs : []).catch(() => {});
};

export const setStoredCVs = (cvs) => {
  cvStore.setLocal(Array.isArray(cvs) ? cvs : []);
};

export const upsertCVApplication = (applicationData) => {
  const cvs = readCVs();
  const nextCVs = cvs.some((cv) => cv.id === applicationData.id)
    ? cvs.map((cv) => (cv.id === applicationData.id ? applicationData : cv))
    : [...cvs, applicationData];

  saveCVs(nextCVs);
  return applicationData;
};

export const submitCareerApplication = (applicationData) => {
  const cvs = readCVs();
  const newApplication = {
    id: `${Date.now()}-${Math.random()}`,
    ...applicationData,
    submittedAt: new Date().toISOString(),
    date: new Date().toLocaleDateString(),
  };

  saveCVs([...cvs, newApplication]);
  return newApplication;
};

export const getStoredCVs = () => readCVs();

export const getCVById = (id) => readCVs().find((cv) => cv.id === id);

export const deleteCVApplication = (id) => {
  saveCVs(readCVs().filter((cv) => cv.id !== id));
};

export const updateCVApplicationStatus = (id, status) => {
  const updatedCVs = readCVs().map((cv) =>
    cv.id === id ? { ...cv, status, reviewedAt: new Date().toISOString() } : cv
  );

  saveCVs(updatedCVs);
  return updatedCVs.find((cv) => cv.id === id) || null;
};

export const getCVEvent = () => cvEvent;
