import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

const SESSION_COOKIE = "madar_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured.");
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: { userId: number; role: UserRole }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getJwtSecret());
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    // #region agent log
    fetch('http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'51cdae'},body:JSON.stringify({sessionId:'51cdae',runId:'pre-fix',location:'lib/auth.ts:getSessionFromCookie',message:'session_lookup_no_cookie',data:{},timestamp:Date.now(),hypothesisId:'H10'})}).catch(()=>{});
    // #endregion
    return null;
  }

  try {
    const verified = await jwtVerify(token, getJwtSecret());
    const payload = verified.payload as { userId: number; role: UserRole };
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session) {
      // #region agent log
      fetch('http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'51cdae'},body:JSON.stringify({sessionId:'51cdae',runId:'pre-fix',location:'lib/auth.ts:getSessionFromCookie',message:'session_lookup_db_miss',data:{hasToken:true},timestamp:Date.now(),hypothesisId:'H10'})}).catch(()=>{});
      // #endregion
      return null;
    }
    if (!session.user.isActive || session.expiresAt < new Date()) {
      // #region agent log
      fetch('http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'51cdae'},body:JSON.stringify({sessionId:'51cdae',runId:'pre-fix',location:'lib/auth.ts:getSessionFromCookie',message:'session_lookup_inactive_or_expired',data:{isActive:session.user.isActive,expired:session.expiresAt < new Date()},timestamp:Date.now(),hypothesisId:'H10'})}).catch(()=>{});
      // #endregion
      return null;
    }
    // #region agent log
    fetch('http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'51cdae'},body:JSON.stringify({sessionId:'51cdae',runId:'pre-fix',location:'lib/auth.ts:getSessionFromCookie',message:'session_lookup_ok',data:{userId:session.user.id,role:session.user.role},timestamp:Date.now(),hypothesisId:'H10'})}).catch(()=>{});
    // #endregion

    return {
      token,
      user: session.user,
      payload,
    };
  } catch {
    // #region agent log
    fetch('http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'51cdae'},body:JSON.stringify({sessionId:'51cdae',runId:'pre-fix',location:'lib/auth.ts:getSessionFromCookie',message:'session_lookup_jwt_invalid',data:{},timestamp:Date.now(),hypothesisId:'H10'})}).catch(()=>{});
    // #endregion
    return null;
  }
}

export async function createDbSession(userId: number, token: string) {
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  await prisma.session.create({
    data: { userId, token, expiresAt },
  });
}

export async function deleteDbSession(token: string) {
  await prisma.session.deleteMany({ where: { token } });
}
