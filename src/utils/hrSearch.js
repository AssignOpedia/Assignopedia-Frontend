import { useEffect, useState } from "react";

const hrSearchEvent = "assignopedia-hr-search-updated";
let hrSearchQuery = "";

export const getHrSearchQuery = () => hrSearchQuery;

export const setHrSearchQuery = (query) => {
  hrSearchQuery = query;
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

    window.addEventListener(hrSearchEvent, handleSearchUpdate);

    return () => {
      window.removeEventListener(hrSearchEvent, handleSearchUpdate);
    };
  }, []);

  return query;
};
