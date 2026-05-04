/**
 * Runtime DB URL must match how `prisma.config.ts` builds the URL for CLI,
 * otherwise migrations can work while the Next.js app points at the wrong DB
 * or has no usable `DATABASE_URL`.
 */

let warnedDatabaseUrlOverridesDbVars = false;

/** Log once when both DATABASE_URL and DB_* exist (Hostinger: stale DATABASE_URL often causes P1000). */
function warnIfDatabaseUrlOverridesDbVars(): void {
  if (warnedDatabaseUrlOverridesDbVars) return;
  const explicit = process.env.DATABASE_URL?.trim();
  if (!explicit) return;
  const hasDbVars =
    Boolean(process.env.DB_HOST?.trim()) &&
    Boolean(process.env.DB_USER?.trim()) &&
    process.env.DB_PASSWORD !== undefined &&
    Boolean(process.env.DB_NAME?.trim());
  if (!hasDbVars) return;
  warnedDatabaseUrlOverridesDbVars = true;
  console.warn(
    "[database-url] DATABASE_URL and DB_* are both set; DATABASE_URL wins. If you see database authentication errors, remove or fix DATABASE_URL so DB_* (with encoded password) is used, or keep only a correct DATABASE_URL.",
  );
}

/** Append Prisma/MySQL driver params if absent (helps flaky networks / pool waits). */
export function applyMysqlUrlDefaults(url: string): string {
  if (!url.startsWith("mysql://")) return url;
  const additions: string[] = [];
  if (!/[?&]connect_timeout=/.test(url)) additions.push("connect_timeout=30");
  if (!/[?&]pool_timeout=/.test(url)) additions.push("pool_timeout=30");
  if (additions.length === 0) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}${additions.join("&")}`;
}

export function resolveDatabaseUrl(): string {
  warnIfDatabaseUrlOverridesDbVars();
  const explicit = process.env.DATABASE_URL?.trim();
  let raw: string;
  if (explicit) {
    raw = explicit;
  } else {
    const host = process.env.DB_HOST?.trim();
    const user = process.env.DB_USER?.trim();
    const password = process.env.DB_PASSWORD;
    const database = process.env.DB_NAME?.trim();
    const port = process.env.DB_PORT?.trim() || "3306";

    if (!host || !user || password === undefined || !database) {
      throw new Error(
        "Database URL is not configured. Set DATABASE_URL or DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME.",
      );
    }

    raw = `mysql://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
  }

  return applyMysqlUrlDefaults(raw);
}

/** Used by `prisma.config.ts` so `prisma generate` does not require DB env at build time. */
const PLACEHOLDER_DATABASE_URL =
  "mysql://user:password@localhost:3306/database";

/**
 * Same as `resolveDatabaseUrl()` when env is set; otherwise returns a placeholder URL.
 * Allows `prisma generate` (no DB connection) during CI/panel builds. Runtime code should
 * keep using `resolveDatabaseUrl()` so misconfiguration still fails loudly at startup.
 */
export function resolveDatabaseUrlOrPlaceholder(): string {
  try {
    return resolveDatabaseUrl();
  } catch {
    return PLACEHOLDER_DATABASE_URL;
  }
}
