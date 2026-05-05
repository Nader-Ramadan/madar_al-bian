import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { passwordResetSchema } from "@/lib/schemas";
import { hashPassword } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limit = checkRateLimit(`password-reset:${ip}`);
  if (!limit.allowed) return fail("Too many requests. Try again later.", 429);

  const parsed = passwordResetSchema.safeParse(await request.json());
  if (!parsed.success) return fail("Invalid payload", 400, parsed.error.flatten());

  const tokenRow = await prisma.passwordResetToken.findUnique({
    where: { token: parsed.data.token },
    include: { user: true },
  });
  if (!tokenRow || tokenRow.usedAt || tokenRow.expiresAt < new Date() || !tokenRow.user.isActive) {
    return fail("Invalid or expired token", 400);
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.$transaction([
    prisma.user.update({ where: { id: tokenRow.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({
      where: { id: tokenRow.id },
      data: { usedAt: new Date() },
    }),
    prisma.session.deleteMany({ where: { userId: tokenRow.userId } }),
  ]);

  return ok({ reset: true });
}
