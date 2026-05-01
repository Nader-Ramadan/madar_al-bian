import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const adminPathRegex = /^\/(admin|api\/admin)(\/|$)/;

async function hasValidSession(request: NextRequest) {
  const token = request.cookies.get("madar_session")?.value;
  if (!token) return { ok: false as const, reason: "no_token" };
  if (!process.env.JWT_SECRET) return { ok: false as const, reason: "no_secret" };

  try {
    const verified = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    const payload = verified.payload as { role?: string };
    if (payload.role !== "ADMIN") return { ok: false as const, reason: "role_not_admin" };
    return { ok: true as const, reason: "ok" };
  } catch {
    return { ok: false as const, reason: "jwt_invalid" };
  }
}

export async function proxy(request: NextRequest) {
  if (!adminPathRegex.test(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const sessionCheck = await hasValidSession(request);
  // #region agent log
  fetch('http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'51cdae'},body:JSON.stringify({sessionId:'51cdae',runId:'pre-fix',location:'proxy.ts:proxy',message:'proxy_admin_check',data:{path:request.nextUrl.pathname,ok:sessionCheck.ok,reason:sessionCheck.reason},timestamp:Date.now(),hypothesisId:'H9'})}).catch(()=>{});
  // #endregion
  if (!sessionCheck.ok) {
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
