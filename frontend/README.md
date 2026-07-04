# Assignopedia Frontend

React + Vite client for Assignopedia.

## Run Locally

```bash
npm install
npm run dev
```

By default the app calls `/api`, which is proxied by Vite to `http://localhost:5000`.

To point the frontend at a deployed backend, set:

```bash
VITE_API_URL=https://YOUR-BACKEND.onrender.com/api
```

## Build

```bash
npm run build
```

The production build is emitted to `dist`.
