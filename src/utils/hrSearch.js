import { useEffect, useState } from "react";

const hrSearchKey = "assignopediaHrSearchQuery";
const hrSearchEvent = "assignopedia-hr-search-updated";

export const getHrSearchQuery = () => localStorage.getItem(hrSearchKey) || "";

export const setHrSearchQuery = (query) => {
  localStorage.setItem(hrSearchKey, query);
  window.dispatchEvent(new CustomEvent(hrSearchEvent, { detail: query }));
};

export const itemMatchesSearch = (item, query) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return Object.values(item)
    .filter((value) => value !== null && value !== undefined)
    .some((value) => String(value).toLowerCase().includes(normalizedQuery));
};

export const useHrSearchQuery = () => {
  const [query, setQuery] = useState(getHrSearchQuery);

  useEffect(() => {
    const handleSearchUpdate = (event) => {
      setQuery(event.detail || getHrSearchQuery());
    };

    const handleStorageUpdate = (event) => {
      if (event.key === hrSearchKey) {
        setQuery(event.newValue || "");
      }
    };

    window.addEventListener(hrSearchEvent, handleSearchUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      window.removeEventListener(hrSearchEvent, handleSearchUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  return query;
};
