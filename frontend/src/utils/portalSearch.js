import { useEffect, useState } from "react";

const searchState = new Map();

const normalizeSearchText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[\s,._:/\\-]+/g, " ")
    .trim();

const collectSearchValues = (value, values = []) => {
  if (value === null || value === undefined) {
    return values;
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    values.push(String(value));
    return values;
  }

  if (value instanceof Date) {
    values.push(value.toISOString());
    values.push(value.toLocaleString());
    return values;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectSearchValues(item, values));
    return values;
  }

  if (typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => {
      values.push(key);
      collectSearchValues(item, values);
    });
  }

  return values;
};

const getSearchEventName = (scope) => `assignopedia-${scope}-search-updated`;

export const getSearchQuery = (scope) => searchState.get(scope) || "";

export const setSearchQuery = (scope, query) => {
  const nextQuery = String(query || "");

  searchState.set(scope, nextQuery);
  window.dispatchEvent(new CustomEvent(getSearchEventName(scope), { detail: nextQuery }));
};

export const itemMatchesSearch = (item, query) => {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return true;
  }

  const compactQuery = normalizedQuery.replace(/\s+/g, "");
  const searchValues = collectSearchValues(item);

  return searchValues.some((value) => {
    const normalizedValue = normalizeSearchText(value);
    const compactValue = normalizedValue.replace(/\s+/g, "");

    return normalizedValue.includes(normalizedQuery) || compactValue.includes(compactQuery);
  });
};

export const usePortalSearchQuery = (scope) => {
  const [query, setQuery] = useState(() => getSearchQuery(scope));

  useEffect(() => {
    const handleSearchUpdate = (event) => {
      setQuery(event.detail || getSearchQuery(scope));
    };
    const eventName = getSearchEventName(scope);

    window.addEventListener(eventName, handleSearchUpdate);

    return () => {
      window.removeEventListener(eventName, handleSearchUpdate);
    };
  }, [scope]);

  return query;
};
