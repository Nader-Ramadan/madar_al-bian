import { NextRequest, NextResponse } from "next/server";
// #region agent log
import net from "node:net";
import { resolveDatabaseUrl } from "@/lib/database-url";
import { prisma } from "@/lib/prisma";

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
    sock.once("data", (buf: Buffer) => {
      // MySQL first packet: 0x0a = server greeting, 0xff = error packet (e.g. 1130 host not allowed)
      const kind = buf[4];
      if (kind === 0xff) {
        done({ ok: true, greeting: "error", mysqlErrno: buf.readUInt16LE(5), mysqlMessage: buf.subarray(7).toString("utf8").replace(/^#\w{5}/, "").slice(0, 200) });
      } else if (kind === 0x0a) {
        const end = buf.indexOf(0, 5);
        done({ ok: true, greeting: "handshake", serverVersion: buf.subarray(5, end).toString("utf8") });
      } else {
        done({ ok: true, greeting: "unknown", firstByte: kind });
      }
    });
    sock.once("close", () => done({ ok: false, error: "CLOSED_BEFORE_GREETING" }));
    sock.once("error", (e: NodeJS.ErrnoException) => done({ ok: false, error: e.code || e.message }));
  });
  const q0 = Date.now();
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    info.prismaQuery = { ok: true, ms: Date.now() - q0 };
  } catch (err) {
    const e = err as { code?: string; errorCode?: string; name?: string; message?: string };
    info.prismaQuery = {
      ok: false,
      ms: Date.now() - q0,
      name: e.name ?? null,
      code: e.code ?? e.errorCode ?? null,
      message: (e.message ?? String(err)).replace(/mysql:\/\/[^@\s]+@/g, "mysql://***@").slice(0, 400),
    };
  }
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
