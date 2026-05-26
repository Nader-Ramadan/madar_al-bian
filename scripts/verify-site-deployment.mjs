/**
 * Probes SITE_URL and /api/health — detects Hostinger Apache 403 HTML vs Next JSON.
 * Usage: SITE_URL=https://your-domain.com node scripts/verify-site-deployment.mjs
 */
const base = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");

function isHostinger403Html(text) {
  return (
    text.includes("403 Forbidden") &&
    text.includes("Access to this resource on the server is denied")
  );
}

async function probe(path) {
  const url = `${base}${path}`;
  let res;
  let text = "";
  try {
    res = await fetch(url, { headers: { Accept: "application/json, text/html" } });
    text = await res.text();
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    console.error(`[verify-site] Fetch failed: ${url}\n${err}`);
    return { ok: false };
  }

  const hostinger403 = isHostinger403Html(text);
  let jsonOk = false;
  try {
    const body = JSON.parse(text);
    jsonOk = body?.ok === true || body?.success === true;
  } catch {
    /* not JSON */
  }

  console.log(
    `[verify-site] ${url} → HTTP ${res.status}, hostinger403=${hostinger403}, jsonOk=${jsonOk}`,
  );
  const ok = !hostinger403 && res.ok && (path === "/" ? true : jsonOk);
  return { ok };
}

const home = await probe("/");
const health = await probe("/api/health");

if (home.ok && health.ok) {
  console.log("[verify-site] OK: site and /api/health reach Next (not Hostinger 403 HTML).");
  process.exit(0);
}

console.error("[verify-site] FAIL: Hostinger-style 403 or API not reaching Node.");
process.exit(1);
