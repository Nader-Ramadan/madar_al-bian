/**
 * Validates the same DB env contract as lib/database-url.ts (no TS import).
 * Loads .env, .env.production, .env.local (see scripts/load-project-env.mjs).
 * Run on Hostinger SSH: node scripts/check-db-env.mjs
 * or: npm run check:db-env
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadProjectEnv } from "./load-project-env.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
await loadProjectEnv(root);

/**
 * Split mysql://user:password@host... using the last @ (Hostinger passwords rarely contain raw @).
 * @returns {{ user: string, password: string } | null}
 */
function splitMysqlUserPassword(dsn) {
  if (!dsn || typeof dsn !== "string" || !dsn.toLowerCase().startsWith("mysql://")) return null;
  const rest = dsn.slice("mysql://".length);
  const at = rest.lastIndexOf("@");
  if (at <= 0) return null;
  const userpass = rest.slice(0, at);
  const colon = userpass.indexOf(":");
  if (colon === -1) return { user: userpass, password: "" };
  return {
    user: userpass.slice(0, colon),
    password: userpass.slice(colon + 1),
  };
}

/** Warn when password in DATABASE_URL likely needs percent-encoding (common P1000 cause). */
function warnIfDatabaseUrlPasswordLooksUnencoded(dsn) {
  const parts = splitMysqlUserPassword(dsn);
  if (!parts?.password) return;
  const { password } = parts;
  try {
    decodeURIComponent(password);
  } catch {
    console.warn(
      "[check-db-env] DATABASE_URL password segment is not valid percent-encoding (decodeURIComponent failed). Fix % sequences or use DB_* vars instead.",
    );
    return;
  }
  // After removing valid %XX triplets, leftover delimiters usually mean the URL userinfo is wrong.
  const withoutPct = password.replace(/%[0-9A-Fa-f]{2}/gi, "");
  if (/[;:@/?# ]/.test(withoutPct)) {
    console.warn(
      "[check-db-env] DATABASE_URL password still contains ; : @ / ? # or space outside percent-encoding. Encode them (e.g. ; → %3B) or use DB_HOST, DB_USER, DB_PASSWORD, DB_NAME only (lib/database-url.ts encodes DB_PASSWORD).",
    );
  }
}

/** When only DATABASE_URL is used, remind that it must match the real MySQL password exactly. */
function tipDatabaseUrlOnlyMode() {
  const explicit = process.env.DATABASE_URL?.trim();
  if (!explicit) return;
  const host = process.env.DB_HOST?.trim();
  const user = process.env.DB_USER?.trim();
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME?.trim();
  const hasFullDbVars =
    Boolean(host) &&
    Boolean(user) &&
    password !== undefined &&
    Boolean(database);
  if (hasFullDbVars) return;
  console.warn(
    "[check-db-env] Only DATABASE_URL is set (no DB_*). The password inside the URL must be exactly the MySQL user password (with special chars percent-encoded). " +
      "If auth still fails, copy the connection string from hPanel → MySQL or switch to DB_* only.",
  );
}

function warnIfBothDatabaseUrlStyles() {
  const explicit = process.env.DATABASE_URL?.trim();
  const host = process.env.DB_HOST?.trim();
  const user = process.env.DB_USER?.trim();
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME?.trim();
  const hasDbVars =
    Boolean(host) &&
    Boolean(user) &&
    password !== undefined &&
    Boolean(database);
  if (explicit && hasDbVars) {
    console.warn(
      "[check-db-env] DATABASE_URL and DB_* are both set. At runtime DATABASE_URL wins (lib/database-url.ts). " +
        "If you get authentication errors, remove the wrong DATABASE_URL from hPanel or fix the URL; " +
        "or remove DATABASE_URL and use only DB_* so the password is URL-encoded automatically.",
    );
  }
}

function main() {
  warnIfBothDatabaseUrlStyles();
  const explicit = process.env.DATABASE_URL?.trim();
  if (explicit) {
    warnIfDatabaseUrlPasswordLooksUnencoded(explicit);
    tipDatabaseUrlOnlyMode();
    console.log("[check-db-env] OK: DATABASE_URL is set.");
    process.exit(0);
  }

  const host = process.env.DB_HOST?.trim();
  const user = process.env.DB_USER?.trim();
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME?.trim();

  if (!host || !user || password === undefined || !database) {
    console.error(
      "[check-db-env] Missing database configuration.\n" +
        "Set DATABASE_URL in hPanel (Node.js → Environment variables), or set all of:\n" +
        "  DB_HOST, DB_USER, DB_PASSWORD, DB_NAME (optional DB_PORT, default 3306)\n" +
        "Then restart the Node application.",
    );
    process.exit(1);
  }

  console.log("[check-db-env] OK: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME are set.");
  process.exit(0);
}

main();
