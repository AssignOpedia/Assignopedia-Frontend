# Assignopedia

Assignopedia is split into two deployable services:

- `frontend/` - React + Vite client
- `backend/` - Express API connected to MongoDB Atlas

## Local Development

Install each service once:

```bash
npm --prefix frontend install
npm --prefix backend install
```

Run both services from the repository root:

```bash
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies `/api` requests to the backend at `http://localhost:5000`.

## Render Deployment

Create two Render services from this repository, or use `render.yaml`.

Backend service:

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Health check: `/api/health`
- Required environment variables: `MONGODB_URI`, `CLIENT_ORIGIN`, Cloudinary values, and any SMTP values you want enabled

Frontend service:

- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Required environment variable: `VITE_API_URL=https://YOUR-BACKEND.onrender.com/api`

Set `CLIENT_ORIGIN` on the backend to the deployed frontend URL, for example `https://YOUR-FRONTEND.onrender.com`.
