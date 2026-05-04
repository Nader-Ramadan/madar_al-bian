# Madar Al-Bian Magazine Platform

Next.js + Prisma/MySQL website for magazine publishing, conferences, blogs, advisory members, and admin content management.

## Setup

1. Install dependencies:
   - `npm install`
2. Configure environment variables:
   - **Database (Hostinger only for production):** set either **`DATABASE_URL`** (`mysql://…`) or **`DB_HOST`**, **`DB_USER`**, **`DB_PASSWORD`**, **`DB_NAME`**, **`DB_PORT`** in **Hostinger hPanel** (Node.js app → Environment variables) or in **`.env.production`** on the server—see [`lib/database-url.ts`](lib/database-url.ts). Do not put production DB credentials in **`.env.local`**. The Next.js app and `prisma db seed` must use the **same** database. For one-off CLI commands from your PC (migrate/seed), use a private untracked `.env` with the same Hostinger values only if Remote MySQL allows your IP, or run commands over SSH on the Hostinger host where env is already set.
   - Auth: `JWT_SECRET`, `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD`, `BOOTSTRAP_ADMIN_NAME`
   - Google sign-in (optional): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_GOOGLE_REDIRECT_URI` (must match the authorized redirect URI in Google Cloud Console, e.g. `https://yourdomain.com/api/auth/google/callback`). Only Google accounts whose email matches an existing active `ADMIN` user in the database receive a session for the workspace.
   - Storage: `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_BASE_URL`
   - SMTP (Email Center): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
3. Apply database schema (choose one):
   - **Migrate (recommended for production):** `npx prisma migrate deploy` (or `npx prisma migrate dev` in development) so migrations such as `add_magazine_metadata` run against your MySQL database.
   - **Push (dev only):** `npx prisma db push` if you are not using migration history yet.
4. Generate Prisma client:
   - `npx prisma generate`
5. Optional — seed placeholder magazines (3+ rows with ISSN, impact factor, versions, etc.):
   - `npm run db:seed` or `npx prisma db seed` runs `migrations.seed` from `prisma.config.ts` (`node prisma/seed.mjs`). Idempotent by magazine title; requires a working DB.
6. Run dev server:
   - `npm run dev`

### Magazines page shows “no magazines” or a load error

- The `/magazines` listing reads **only** from MySQL via `GET /api/magazines`. Placeholders are **not** hardcoded in the UI; they are inserted by the seed script ([`prisma/seed.mjs`](prisma/seed.mjs)).
- **Empty list (no error):** the `magazines` table has no rows. Run migrations (step 3), then **`npm run db:seed`**, then reload `/magazines`.
- **Error message on the page:** usually DB unreachable or misconfigured env. Fix `DATABASE_URL` / `DB_*`, restart `npm run dev`, and open **`/api/magazines?limit=5`** — expect `200` and `"success": true` with a non-empty `data.items` after seeding.
- **`prisma db seed` fails (e.g. P2022 column does not exist):** the database schema is behind the Prisma schema. Run **`npx prisma migrate deploy`** (or **`migrate dev`**) before **`npm run db:seed`**.

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
2. Set required variables in **hPanel → Environment variables** and/or **`.env.production`** on the server (same keys as `.env.example`). Prefer hPanel for **database** credentials so they are not kept only in a local `.env.local`.
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

### If production shows “Database URL is not configured”

1. In **hPanel → Websites → Manage → Node.js** (or your panel’s **Environment variables**), add **`DATABASE_URL`** *or* **`DB_HOST`**, **`DB_USER`**, **`DB_PASSWORD`**, **`DB_NAME`** (same rules as [`.env.example`](.env.example) and [`lib/database-url.ts`](lib/database-url.ts)).
2. **Restart** the Node application.
3. On **SSH** or the panel terminal, run **`npm run check:db-env`** — it should print `OK`. The script loads **`.env`**, **`.env.production`**, then **`.env.local`** (see [`scripts/load-project-env.mjs`](scripts/load-project-env.mjs)); Prisma CLI uses the same file order via [`prisma.config.ts`](prisma.config.ts). If the table is empty, run **`npx prisma migrate deploy`** then **`npm run db:seed`** against that same database.

### Database authentication failed (P1000 / access denied)

This is **different** from “Database URL is not configured”: the app reached MySQL but the user/password or **client host** was rejected (see [`lib/load-magazines-page.ts`](lib/load-magazines-page.ts) and [`lib/database-url.ts`](lib/database-url.ts)).

1. **Precedence** — If **`DATABASE_URL`** and **`DB_*`** are both set in hPanel, **`DATABASE_URL` wins** (no auto-encoding of the password inside the URL). A stale or wrong `DATABASE_URL` causes auth errors even when `DB_*` is correct. **Fix:** remove the wrong variable set, or keep only **`DB_HOST`**, **`DB_USER`**, **`DB_PASSWORD`**, **`DB_NAME`** (and **`DB_PORT`**) so the URL is built with `encodeURIComponent` on the password. The app and **`npm run check:db-env`** log a **one-time warning** when both styles are present.
2. **Password in `DATABASE_URL`** — Special characters (`@`, `:`, `/`, `#`, `?`, `%`, etc.) must be **percent-encoded** in the URL, or use **`DB_*`** only instead.
3. **hPanel** — Reset the MySQL user password if unsure; copy host/user/database from **Databases → MySQL** (use the panel hostname, often `*.hstgr.io`, not `localhost`, unless Hostinger documents otherwise).
4. **Remote MySQL** — If the error mentions the user not being allowed **from this host**, open **hPanel → Databases → Remote MySQL** (or manage user hosts) and allow the **IP of the machine running Node** (your VPS or app server).
5. **Restart** the Node app after any env change.
6. **Verify from SSH** (same `.env` / `.env.production` as production): **`npm run verify:db-prisma`** runs `check:db-env` then **`npx prisma migrate status`** (real DB handshake). Then open **`/api/magazines?limit=5`** in the browser or **`SITE_URL=https://your-domain.com npm run verify:magazines-api`**.

### After you SSH (Hostinger)

1. **App root** — `cd` to the same directory Hostinger uses as **Application root** (must contain `package.json` and `server.js`). Confirm with `test -f package.json && echo OK` (Linux) or check that `package.json` is listed in that folder.
2. **Database env in this shell** — hPanel environment variables are often **not** exported into an interactive SSH session. Use one of:
   - A **`.env`** or **`.env.production`** file in the app directory with `DATABASE_URL` (or `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`), matching [`.env.example`](.env.example) — do not commit these files; restrict permissions on the server (`chmod 600 .env*`).
   - Or, for one session only: `export DATABASE_URL='mysql://…'`.
3. Run **`npm run check:db-env`** — expect `OK: DATABASE_URL is set` or `OK: DB_* are set`.
4. Run **`npx prisma generate`**, then **`npx prisma migrate deploy`**. If the `magazines` table is empty, run **`npm run db:seed`**.
5. Run **`npm run build`**, then **Restart** the Node app in hPanel (or restart PM2 if you use it).
6. Verify: open **`https://your-domain/api/magazines?limit=5`** in a browser, or from SSH: **`SITE_URL=https://your-domain.com npm run verify:magazines-api`**. If you get HTML instead of JSON, fix Node routing/port/startup file before debugging the database (see below).

### hPanel Node.js Application (Hostinger)

Use these settings so installs and runtime match this repo (see root `.nvmrc` and `.npmrc`).

- **Node.js version**: **20.x** (LTS). The app requires Node `>=20.11.0` per `package.json` `engines`.
- **Application root**: folder where the project files live (e.g. under `domains/yourdomain.com/…`).
- **Application URL**: your public domain.
- **Application startup file**: use the repo’s [`server.js`](server.js) as the entry (or `npm run start`), which runs `next start` bound to **`PORT`** from the panel. If your panel only accepts a path to one file, set it to **`server.js`** in the application root. Alternatively point at `node_modules/next/dist/bin/next` with arguments `start -p $PORT`.
- **Verify API reaches Next (not static HTML):** open `https://your-domain/api/magazines?limit=5` in a browser. You should see **JSON** (`"success": true` or an `"error"` field). If you see an HTML page or a generic hosting page, `/api/*` is not routed to the Node process—fix the Node app URL, port, or proxy before debugging the database. From SSH you can run **`SITE_URL=https://your-domain.com npm run verify:magazines-api`** (same check as a script).
- **Environment variables**: add everything from **Setup** / `.env.example` in the panel (especially `DATABASE_URL`, `JWT_SECRET`, S3, SMTP, Google OAuth). Optionally set `PRISMA_SKIP_POSTINSTALL_GENERATE=1` for extra safety. After changing **`DATABASE_URL`** or **`DB_*`**, restart the Node application so the process picks up new values.
- **Build vs runtime DB env**: `prisma generate` (run by `prebuild` before `next build`) does **not** need a real database URL—`prisma.config.ts` uses a placeholder when env is missing so panel build stages (e.g. under `.builds/source/repository`) do not fail. For **`prisma migrate deploy`** and for the **running app**, you still **must** set `DATABASE_URL` or `DB_HOST` + `DB_USER` + `DB_PASSWORD` + `DB_NAME` in hPanel; many panels only inject env at process start, not during build, so the code path above keeps builds working either way.
- **Install**: run **NPM install** from the panel. Prisma client is generated during `npm run build` via the `prebuild` script (`prisma generate`), not during `npm install`—this avoids common “Failed to install dependencies” failures when `postinstall` cannot download Prisma engines under panel limits.
- **After install**: in the panel terminal (or SSH), run `npx prisma generate`, `npx prisma migrate deploy`, then `npm run build`, then **Restart** the app.

### Fallback: pre-built upload (if panel install still fails)

If **NPM install** still fails (memory, disk, or time limits), build on a machine you control and upload artifacts instead of relying on the panel to install everything.

1. On a **Linux** environment (WSL2 or Docker `node:20-bookworm` recommended so Prisma engines match the server): `npm ci`, `npx prisma generate`, `npm run build`.
2. Upload to the app directory: `package.json`, `package-lock.json`, `server.js`, `next.config.ts`, `prisma/`, `public/`, `app/`, `lib/`, `proxy.ts`, `tsconfig.json`, `.next/`, and `node_modules/` (including `node_modules/.prisma` and Prisma engine binaries built for **Linux**, not Windows-only paths).
3. In hPanel, skip a full **NPM install** if everything is already present; **Restart** the Node application.

### Shared hosting note
- Hostinger shared hosting commonly fails with memory/runtime limits for `next build` and cannot reliably run this server-rendered Next.js + Prisma stack.
- If you must stay on shared hosting, you would need a static-only rewrite (no API routes/auth/Prisma runtime).
