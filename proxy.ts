import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const adminPathRegex = /^\/(admin|api\/admin)(\/|$)/;

async function hasValidSession(request: NextRequest) {
  const token = request.cookies.get("madar_session")?.value;
  if (!token || !process.env.JWT_SECRET) return false;

  try {
    const verified = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    const payload = verified.payload as { role?: string };
    return payload.role === "ADMIN";
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  if (!adminPathRegex.test(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  if (!(await hasValidSession(request))) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
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
