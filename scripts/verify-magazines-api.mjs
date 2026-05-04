/**
 * GET /api/magazines?limit=5 — use after deploy to confirm DB + API routing.
 * Usage:
 *   SITE_URL=https://your-domain.com npm run verify:magazines-api
 *   SITE_URL=http://localhost:3000 npm run verify:magazines-api
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
try {
  const { config } = await import("dotenv");
  config({ path: path.join(root, ".env") });
  config({ path: path.join(root, ".env.local"), override: true });
} catch {
  /* optional */
}

const base = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const url = `${base}/api/magazines?limit=5`;

async function main() {
  let res;
  try {
    res = await fetch(url, { headers: { Accept: "application/json" } });
  } catch (e) {
    console.error(`[verify-magazines-api] Fetch failed: ${url}`);
    console.error(e);
    process.exit(1);
  }

  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    console.error(
      `[verify-magazines-api] Expected JSON from ${url} (status ${res.status}). Got non-JSON (wrong route to Node?).`,
    );
    console.error(text.slice(0, 500));
    process.exit(1);
  }

  if (!res.ok) {
    console.error(`[verify-magazines-api] HTTP ${res.status}:`, body);
    process.exit(1);
  }

  if (body.success !== true) {
    console.error("[verify-magazines-api] Response missing success:true:", body);
    process.exit(1);
  }

  const items = body.data?.items;
  const n = Array.isArray(items) ? items.length : 0;
  console.log(`[verify-magazines-api] OK: ${url} → success, ${n} magazine(s) in payload.`);
  process.exit(0);
}

main();
