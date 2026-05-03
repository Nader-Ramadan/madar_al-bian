import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import {
  createDbSession,
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth";
import { createGoogleOAuthClient, OAUTH_GOOGLE_STATE_COOKIE } from "@/lib/google-oauth";
import { prisma } from "@/lib/prisma";

function redirectToLogin(request: NextRequest, message: string) {
  return NextResponse.redirect(
    new URL(`/login?error=${encodeURIComponent(message)}`, request.url),
  );
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    return redirectToLogin(request, "Google sign-in was cancelled or failed");
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get(OAUTH_GOOGLE_STATE_COOKIE)?.value;
  cookieStore.delete(OAUTH_GOOGLE_STATE_COOKIE);

  if (!code || !state || !savedState || state !== savedState) {
    return redirectToLogin(request, "Invalid OAuth state. Please try again.");
  }

  try {
    const client = createGoogleOAuthClient();
    const { tokens } = await client.getToken(code);
    if (!tokens.id_token) {
      return redirectToLogin(request, "Google did not return an ID token");
    }

    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    if (!clientId) {
      return redirectToLogin(request, "Google sign-in is not configured");
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    const email = payload?.email?.toLowerCase().trim();
    const emailVerified = payload?.email_verified;

    if (!email || !emailVerified) {
      return redirectToLogin(
        request,
        "Google account email is missing or not verified",
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.isActive || user.role !== UserRole.ADMIN) {
      return redirectToLogin(
        request,
        "تعذر تسجيل الدخول بهذا الحساب. تحقق من البريد أو جرّب طريقة أخرى.",
      );
    }

    const sessionToken = await createSessionToken({
      userId: user.id,
      role: user.role,
    });
    await createDbSession(user.id, sessionToken);
    await setSessionCookie(sessionToken);

    return NextResponse.redirect(new URL("/admin", request.url));
  } catch {
    return redirectToLogin(request, "Google sign-in failed. Please try again.");
  }
}
