# Madar Al-Bian Magazine Platform

Next.js + Prisma/MySQL website for magazine publishing, conferences, blogs, advisory members, and admin content management.

## Setup

1. Install dependencies:
   - `npm install`
2. Configure environment variables in `.env`:
   - DB: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`
   - Auth: `JWT_SECRET`, `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD`, `BOOTSTRAP_ADMIN_NAME`
   - Storage: `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_BASE_URL`
   - SMTP (Email Center): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
3. Generate Prisma client:
   - `npx prisma generate`
4. Run dev server:
   - `npm run dev`

## Core API Endpoints

### Auth
- `POST /api/auth/bootstrap` create first admin from env vars (one-time)
- `POST /api/auth/login` admin/editor login
- `POST /api/auth/logout` logout and clear session
- `GET /api/auth/me` get current session user

### Public Content Read APIs
- `GET /api/magazines`
- `GET /api/magazines/:id`
- `GET /api/blogs`
- `GET /api/blogs/:id`
- `GET /api/conferences`
- `GET /api/conferences/:id`
- `GET /api/advisory-members`
- `GET /api/advisory-members/:id`
- `GET /api/fields`
- `GET /api/fields/:id`
- `GET /api/pdfs`
- `GET /api/pdfs/:id`

### Protected Write APIs (RBAC)
- `POST /api/magazines`, `PUT/DELETE /api/magazines/:id`
- `POST /api/blogs`, `PUT/DELETE /api/blogs/:id`
- `POST /api/conferences`, `PUT/DELETE /api/conferences/:id`
- `POST /api/advisory-members`, `PUT/DELETE /api/advisory-members/:id`
- `POST /api/fields`, `PUT/DELETE /api/fields/:id`
- `POST /api/pdfs`, `DELETE /api/pdfs/:id`

### File Upload (Cloud Storage)
- `PUT /api/pdfs` returns pre-signed upload URL and final file URL
- Upload the PDF directly to storage with returned `uploadUrl`
- Persist metadata with `POST /api/pdfs`

### Traffic Analytics
- `POST /api/magazines/traffic` public event logging (`view`/`download`/`share`)
- `GET /api/magazines/traffic` protected dashboard stats (admin/editor)

### Admin Workflow APIs
- `GET/POST /api/admin/magazine-versions`
- `PUT/DELETE /api/admin/magazine-versions/:id`
- `GET /api/admin/publication-requests`
- `PUT /api/admin/publication-requests/:id`
- `POST /api/publication-requests` (public submission intake)
- `GET /api/admin/emails`
- `POST /api/admin/emails/send`

## Admin Pages
- `/admin/login` for authentication
- `/admin` dashboard home
- `/admin/magazines`
- `/admin/advisors`
- `/admin/approvals`
- `/admin/emails`
- `/admin/content`
- `/admin/traffic` for traffic analytics dashboard

## Security Notes
- Session stored in httpOnly cookie (`madar_session`)
- Admin login accepts only users with `ADMIN` role
- Role checks enforced on write/admin routes
- Login endpoint includes in-memory rate limiting
- Admin paths protected by proxy guard (`/admin/*` and `/api/admin/*`)
