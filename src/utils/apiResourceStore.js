const apiBaseUrl = import.meta.env.VITE_API_URL || "/api";

const stores = new Map();

const clone = (value) => JSON.parse(JSON.stringify(value));

const hasUsableData = (value) => {
  if (Array.isArray(value)) {
    return true;
  }

  return value && typeof value === "object" && Object.keys(value).length > 0;
};

export const createApiResourceStore = ({ resource, event, fallback }) => {
  if (stores.has(resource)) {
    return stores.get(resource);
  }

  let cache = clone(fallback);
  let loaded = false;
  let loadingPromise = null;

  const emit = () => {
    window.dispatchEvent(new CustomEvent(event, { detail: cache }));
  };

  const load = async () => {
    if (loadingPromise) {
      return loadingPromise;
    }

    loadingPromise = fetch(`${apiBaseUrl}/sync/${resource}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Could not load ${resource}.`);
        }

        const data = await response.json();
        cache = hasUsableData(data) ? data : clone(fallback);
        loaded = true;
        emit();
        return cache;
      })
      .finally(() => {
        loadingPromise = null;
      });

    return loadingPromise;
  };

  const save = async (nextValue) => {
    cache = nextValue;
    loaded = true;
    emit();

    const response = await fetch(`${apiBaseUrl}/sync/${resource}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cache),
    });

    if (!response.ok) {
      throw new Error(`Could not save ${resource}.`);
    }

    cache = await response.json();
    emit();
    return cache;
  };

  const store = {
    get: () => {
      if (!loaded) {
        load().catch(() => {});
      }

      return cache;
    },
    load,
    save,
    setLocal: (nextValue) => {
      cache = nextValue;
      loaded = true;
      emit();
      return cache;
    },
  };

  stores.set(resource, store);
  return store;
};
