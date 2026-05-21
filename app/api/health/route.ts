import { NextResponse } from "next/server";

/**
 * Lightweight liveness check — no database. Use on Hostinger to confirm Node/Next is up:
 * GET /api/health → { "ok": true }
 */
export async function GET(request: Request) {
  const host = request.headers.get("host");
  const forwarded = request.headers.get("x-forwarded-host");
  // #region agent log
  fetch("http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "51cdae" },
    body: JSON.stringify({
      sessionId: "51cdae",
      runId: "pre-fix",
      hypothesisId: "H1",
      location: "app/api/health/route.ts:GET",
      message: "health route hit",
      data: { host, forwarded, nodeEnv: process.env.NODE_ENV ?? null },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return NextResponse.json({
    ok: true,
    node: process.version,
    env: process.env.NODE_ENV ?? "unknown",
  });
}
