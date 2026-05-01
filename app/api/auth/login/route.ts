import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import {
  comparePassword,
  createDbSession,
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { UserRole } from "@prisma/client";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  // #region agent log
  fetch('http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'51cdae'},body:JSON.stringify({sessionId:'51cdae',runId:'pre-fix',location:'app/api/auth/login/route.ts:POST',message:'login_api_entry',data:{hasBody:Boolean(request.headers.get('content-type')),ip:String(ip).slice(0,40)},timestamp:Date.now(),hypothesisId:'H6'})}).catch(()=>{});
  // #endregion
  const limit = checkRateLimit(`login:${ip}`);
  if (!limit.allowed) return fail("Too many requests. Try again later.", 429);

  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      // #region agent log
      fetch('http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'51cdae'},body:JSON.stringify({sessionId:'51cdae',runId:'pre-fix',location:'app/api/auth/login/route.ts:POST',message:'login_api_invalid_payload',data:{issues:parsed.error.issues.length},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
      // #endregion
      return fail("Invalid payload", 400, parsed.error.flatten());
    }

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!user || !user.isActive) return fail("Invalid credentials", 401);

    const match = await comparePassword(parsed.data.password, user.passwordHash);
    if (!match) return fail("Invalid credentials", 401);
    if (user.role !== UserRole.ADMIN) return fail("Admin access required", 403);

    const token = await createSessionToken({ userId: user.id, role: user.role });
    await createDbSession(user.id, token);
    await setSessionCookie(token);
    // #region agent log
    fetch('http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'51cdae'},body:JSON.stringify({sessionId:'51cdae',runId:'pre-fix',location:'app/api/auth/login/route.ts:POST',message:'login_api_success',data:{userId:user.id,role:user.role},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
    // #endregion

    return ok({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'51cdae'},body:JSON.stringify({sessionId:'51cdae',runId:'pre-fix',location:'app/api/auth/login/route.ts:POST',message:'login_api_exception',data:{name:error instanceof Error ? error.name : 'unknown'},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    console.error("Login route error:", error);
    return fail("Failed to login", 500);
  }
}
