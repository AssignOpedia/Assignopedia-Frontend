# Assignopedia Express Backend

This backend gives the portal real API endpoints backed by MongoDB Atlas. If MongoDB is unavailable during local development, the API falls back to JSON files in `backend/data` so the app can still run.

## Run

```bash
cd backend
npm install
npm run dev
```

API health check:

```bash
http://localhost:5000/api/health
```

## MongoDB

Copy `.env.example` to `.env` and set:

```bash
MONGODB_URI=your-mongodb-srv-uri
MONGODB_DB_NAME=assignopedia
MONGODB_COLLECTION=appStores
```

The health endpoint reports the active database provider and connection status.

## Email

Nodemailer is already wired. Copy `.env.example` to `.env` and fill SMTP values when you want real email sending. Until then, contact and career APIs still save submissions, and the email response says SMTP was skipped.

## Main APIs

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/blog-posts`, `POST /api/blog-posts`, `PUT /api/blog-posts/:id`, `DELETE /api/blog-posts/:id`
- `GET /api/team`, `PUT /api/team`, `PUT /api/team/leader`, `POST /api/team/members`
- `GET /api/employees`, `POST /api/employees`
- `GET /api/departments`, `POST /api/departments`
- `GET /api/notices`, `POST /api/notices`
- `GET /api/attendance`, `POST /api/attendance`
- `GET /api/leave-requests`, `POST /api/leave-requests`, `PATCH /api/leave-requests/:id/decision`
- `GET /api/wfh-requests`, `POST /api/wfh-requests`, `PATCH /api/wfh-requests/:id/decision`
- `GET /api/cv-applications`, `POST /api/career-submissions`
- `POST /api/contact-submissions`
- `GET /api/notifications/hr`
- `GET /api/notifications/employee/:email`

## Default Logins

- Admin: `raj.admin@assignopedia.com` / `admin123`
- HR: `hr@assignopedia.com` / `hr123`
- Employee: `employee@assignopedia.com` / `employee123`
