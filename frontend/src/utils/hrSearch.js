import {
  getSearchQuery,
  itemMatchesSearch,
  setSearchQuery,
  usePortalSearchQuery,
} from "./portalSearch";

const hrSearchScope = "hr";

export { itemMatchesSearch };

export const getHrSearchQuery = () => getSearchQuery(hrSearchScope);

export const setHrSearchQuery = (query) => setSearchQuery(hrSearchScope, query);

export const useHrSearchQuery = () => usePortalSearchQuery(hrSearchScope);
