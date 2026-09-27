import { NextRequest, NextResponse } from "next/server";
// #region agent log
import net from "node:net";
import { resolveDatabaseUrl } from "@/lib/database-url";

async function probeDb() {
  let host: string | null = null;
  let port = 3306;
  const info: Record<string, unknown> = {
    source: process.env.DATABASE_URL?.trim() ? "DATABASE_URL" : process.env.DB_HOST?.trim() ? "DB_*" : "none",
    bothSet: Boolean(process.env.DATABASE_URL?.trim() && process.env.DB_HOST?.trim()),
    dbHostVar: process.env.DB_HOST?.trim() || null,
  };
  try {
    const u = new URL(resolveDatabaseUrl());
    host = u.hostname;
    port = Number(u.port || 3306);
  } catch (err) {
    info.resolveError = err instanceof Error ? err.message.slice(0, 160) : String(err);
  }
  info.host = host;
  info.port = port;
  if (!host) return info;
  const t0 = Date.now();
  info.tcp = await new Promise((resolve) => {
    const sock = net.connect({ host: host!, port });
    const done = (result: Record<string, unknown>) => {
      sock.destroy();
      resolve({ ...result, ms: Date.now() - t0 });
    };
    sock.setTimeout(10000, () => done({ ok: false, error: "TIMEOUT_10s" }));
    sock.once("connect", () => done({ ok: true }));
    sock.once("error", (e: NodeJS.ErrnoException) => done({ ok: false, error: e.code || e.message }));
  });
  return info;
}
// #endregion

/**
 * Lightweight liveness check — no database. Use on Hostinger to confirm Node/Next is up:
 * GET /api/health → { "ok": true }
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    ok: true,
    node: process.version,
    env: process.env.NODE_ENV ?? "unknown",
    // #region agent log
    ...(request.nextUrl.searchParams.get("db") === "1" ? { db: await probeDb() } : {}),
    // #endregion
  });
}
