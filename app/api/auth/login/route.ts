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
  const limit = checkRateLimit(`login:${ip}`);
  if (!limit.allowed) return fail("Too many requests. Try again later.", 429);

  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return fail("Invalid payload", 400, parsed.error.flatten());

    const emailNorm = parsed.data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: emailNorm } });
    if (!user || !user.isActive) return fail("بيانات الدخول غير صحيحة", 401);

    const match = await comparePassword(parsed.data.password, user.passwordHash);
    if (!match) return fail("بيانات الدخول غير صحيحة", 401);
    if (user.role !== UserRole.ADMIN) return fail("بيانات الدخول غير صحيحة", 401);

    const token = await createSessionToken({ userId: user.id, role: user.role });
    await createDbSession(user.id, token);
    await setSessionCookie(token);

    return ok({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error("Login route error:", error);
    return fail("Failed to login", 500);
  }
}
