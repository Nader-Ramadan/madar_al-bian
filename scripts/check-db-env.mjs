/**
 * Validates the same DB env contract as lib/database-url.ts (no TS import).
 * Run on Hostinger SSH after setting hPanel env: node scripts/check-db-env.mjs
 * or: npm run check:db-env
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
try {
  const { config } = await import("dotenv");
  config({ path: path.join(root, ".env") });
  config({ path: path.join(root, ".env.local"), override: true });
} catch {
  /* dotenv optional; hPanel/CI may inject env only */
}

function main() {
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
