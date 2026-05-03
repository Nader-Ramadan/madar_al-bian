# Madar Al-Bian Magazine Platform

Next.js + Prisma/MySQL website for magazine publishing, conferences, blogs, advisory members, and admin content management.

## Setup

1. Install dependencies:
   - `npm install`
2. Configure environment variables in `.env`:
   - DB: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`
   - Auth: `JWT_SECRET`, `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD`, `BOOTSTRAP_ADMIN_NAME`
   - Google sign-in (optional): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_GOOGLE_REDIRECT_URI` (must match the authorized redirect URI in Google Cloud Console, e.g. `https://yourdomain.com/api/auth/google/callback`). Only Google accounts whose email matches an existing active `ADMIN` user in the database receive a session for the workspace.
   - Storage: `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_BASE_URL`
   - SMTP (Email Center): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
3. Generate Prisma client:
   - `npx prisma generate`
4. Run dev server:
   - `npm run dev`

## Core API Endpoints

### Auth
- `POST /api/auth/bootstrap` create first admin from env vars (one-time)
- `POST /api/auth/login` password login (session issued only for `ADMIN` users)
- `GET /api/auth/google` start Google OAuth (redirects to Google)
- `GET /api/auth/google/callback` OAuth callback; creates session when Google email matches an active `ADMIN` user
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

## Sign-in and workspace pages
- `/login` for account sign-in and registration (legacy `/admin/login` redirects here)
- `/admin` workspace home
- `/admin/magazines`
- `/admin/advisors`
- `/admin/approvals`
- `/admin/emails`
- `/admin/content`
- `/admin/traffic` for traffic analytics dashboard

## Security Notes
- Session stored in httpOnly cookie (`madar_session`)
- Password login issues a session only for users with `ADMIN` role (same error message if not allowed)
- Role checks enforced on write/admin routes
- Login endpoint includes in-memory rate limiting
- Admin paths protected by proxy guard (`/admin/*` and `/api/admin/*`)

## Deployment (Hostinger-safe path)

### Recommended target
- Use **Hostinger VPS (Node.js runtime)**, not shared/static hosting.
- This app requires a Node server (`next start`) and backend APIs/Prisma access.

### Server requirements
- Node.js 20+ (LTS)
- MySQL database reachable from the server
- Process manager (PM2 recommended)

### One-time setup on server
1. Clone repository and install deps:
   - `npm ci`
2. Create `.env` with all required variables (same list from Setup section).
3. Generate Prisma client and apply schema:
   - `npx prisma generate`
   - `npx prisma migrate deploy`
4. Build and run:
   - `npm run build`
   - `npm run start`

### PM2 example
- `npm i -g pm2`
- `pm2 start npm --name madar-albian -- start`
- `pm2 save`
- `pm2 startup`

### hPanel Node.js Application (Hostinger)

Use these settings so installs and runtime match this repo (see root `.nvmrc` and `.npmrc`).

- **Node.js version**: **20.x** (LTS). The app requires Node `>=20.11.0` per `package.json` `engines`.
- **Application root**: folder where the project files live (e.g. under `domains/yourdomain.com/…`).
- **Application URL**: your public domain.
- **Application startup file**: point at Next’s CLI, e.g. `node_modules/next/dist/bin/next`, with arguments like `start -p $PORT` if your panel allows a separate “startup arguments” field. If not, use `npm run start` as the command the panel documents for Node apps (some panels only accept a single entry file—in that case add a small `server.js` that shells `next start` or use Hostinger’s documented Next.js template).
- **Environment variables**: add everything from **Setup** / `.env.example` in the panel (especially `DATABASE_URL`, `JWT_SECRET`, S3, SMTP, Google OAuth). Optionally set `PRISMA_SKIP_POSTINSTALL_GENERATE=1` for extra safety.
- **Install**: run **NPM install** from the panel. Prisma client is generated during `npm run build` via the `prebuild` script (`prisma generate`), not during `npm install`—this avoids common “Failed to install dependencies” failures when `postinstall` cannot download Prisma engines under panel limits.
- **After install**: in the panel terminal (or SSH), run `npx prisma generate`, `npx prisma migrate deploy`, then `npm run build`, then **Restart** the app.

### Fallback: pre-built upload (if panel install still fails)

If **NPM install** still fails (memory, disk, or time limits), build on a machine you control and upload artifacts instead of relying on the panel to install everything.

1. On a **Linux** environment (WSL2 or Docker `node:20-bookworm` recommended so Prisma engines match the server): `npm ci`, `npx prisma generate`, `npm run build`.
2. Upload to the app directory: `package.json`, `package-lock.json`, `next.config.ts`, `prisma/`, `public/`, `app/`, `lib/`, `proxy.ts`, `tsconfig.json`, `.next/`, and `node_modules/` (including `node_modules/.prisma` and Prisma engine binaries built for **Linux**, not Windows-only paths).
3. In hPanel, skip a full **NPM install** if everything is already present; **Restart** the Node application.

### Shared hosting note
- Hostinger shared hosting commonly fails with memory/runtime limits for `next build` and cannot reliably run this server-rendered Next.js + Prisma stack.
- If you must stay on shared hosting, you would need a static-only rewrite (no API routes/auth/Prisma runtime).
