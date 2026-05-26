import { NextResponse } from "next/server";

/**
 * Lightweight liveness check — no database. Use on Hostinger to confirm Node/Next is up:
 * GET /api/health → { "ok": true }
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    node: process.version,
    env: process.env.NODE_ENV ?? "unknown",
  });
}
