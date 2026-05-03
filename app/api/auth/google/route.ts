import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getGoogleAuthorizeUrl, OAUTH_GOOGLE_STATE_COOKIE } from "@/lib/google-oauth";

function redirectToLogin(request: NextRequest, message: string) {
  return NextResponse.redirect(
    new URL(`/login?error=${encodeURIComponent(message)}`, request.url),
  );
}

export async function GET(request: NextRequest) {
  try {
    const state = randomBytes(24).toString("hex");
    const cookieStore = await cookies();
    cookieStore.set(OAUTH_GOOGLE_STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 600,
    });
    const url = getGoogleAuthorizeUrl(state);
    return NextResponse.redirect(url);
  } catch {
    return redirectToLogin(request, "Google sign-in is not configured");
  }
}
