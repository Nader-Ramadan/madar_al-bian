/**
 * Runtime DB URL must match how `prisma.config.ts` builds the URL for CLI,
 * otherwise migrations can work while the Next.js app points at the wrong DB
 * or has no usable `DATABASE_URL`.
 */

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
