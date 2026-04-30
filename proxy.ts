import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const adminPathRegex = /^\/(admin|api\/admin)(\/|$)/;

async function hasValidSession(request: NextRequest) {
  const token = request.cookies.get("madar_session")?.value;
  // #region agent log
  fetch("http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "51cdae" }, body: JSON.stringify({ sessionId: "51cdae", runId: "pre-fix", hypothesisId: "H1", location: "proxy.ts:9", message: "Proxy session cookie presence", data: { hasToken: Boolean(token), hasJwtSecret: Boolean(process.env.JWT_SECRET), path: request.nextUrl.pathname }, timestamp: Date.now() }) }).catch(() => {});
  // #endregion
  if (!token || !process.env.JWT_SECRET) return false;

  try {
    const verified = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    const payload = verified.payload as { role?: string };
    return payload.role === "ADMIN";
  } catch {
    // #region agent log
    fetch("http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "51cdae" }, body: JSON.stringify({ sessionId: "51cdae", runId: "pre-fix", hypothesisId: "H2", location: "proxy.ts:16", message: "JWT verification failed in proxy", data: { path: request.nextUrl.pathname }, timestamp: Date.now() }) }).catch(() => {});
    // #endregion
    return false;
  }
}

export async function proxy(request: NextRequest) {
  // #region agent log
  fetch("http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "51cdae" }, body: JSON.stringify({ sessionId: "51cdae", runId: "pre-fix", hypothesisId: "H3", location: "proxy.ts:23", message: "Proxy route entry", data: { path: request.nextUrl.pathname }, timestamp: Date.now() }) }).catch(() => {});
  // #endregion
  if (!adminPathRegex.test(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  if (!(await hasValidSession(request))) {
    // #region agent log
    fetch("http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "51cdae" }, body: JSON.stringify({ sessionId: "51cdae", runId: "pre-fix", hypothesisId: "H3", location: "proxy.ts:34", message: "Proxy unauthorized branch", data: { path: request.nextUrl.pathname, isApi: request.nextUrl.pathname.startsWith("/api/") }, timestamp: Date.now() }) }).catch(() => {});
    // #endregion
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
