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
