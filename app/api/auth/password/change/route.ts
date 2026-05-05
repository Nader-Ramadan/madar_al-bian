import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { passwordChangeSchema } from "@/lib/schemas";
import { comparePassword, getSessionFromCookie, hashPassword } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session) return fail("Unauthorized", 401);

  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limit = checkRateLimit(`password-change:${session.user.id}:${ip}`);
  if (!limit.allowed) return fail("Too many requests. Try again later.", 429);

  const parsed = passwordChangeSchema.safeParse(await request.json());
  if (!parsed.success) return fail("Invalid payload", 400, parsed.error.flatten());

  const isCurrentMatch = await comparePassword(parsed.data.currentPassword, session.user.passwordHash);
  if (!isCurrentMatch) return fail("Current password is incorrect", 400);

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.$transaction([
    prisma.user.update({ where: { id: session.user.id }, data: { passwordHash } }),
    prisma.session.deleteMany({ where: { userId: session.user.id } }),
  ]);

  return ok({ changed: true });
}
