import { randomBytes } from "crypto";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { passwordForgotSchema } from "@/lib/schemas";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limit = checkRateLimit(`password-forgot:${ip}`);
  if (!limit.allowed) return fail("Too many requests. Try again later.", 429);

  const parsed = passwordForgotSchema.safeParse(await request.json());
  if (!parsed.success) return fail("Invalid payload", 400, parsed.error.flatten());

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.trim().toLowerCase() },
    select: { id: true, email: true, isActive: true },
  });

  if (!user || !user.isActive) {
    return ok({ sent: true });
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30);
  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? request.nextUrl.origin;
  const resetUrl = `${baseUrl}/login?mode=reset&token=${encodeURIComponent(token)}`;
  const emailBody = `Use this link to reset your password:\n${resetUrl}\n\nThis link expires in 30 minutes.`;

  try {
    await sendEmail(user.email, "Password reset", emailBody);
  } catch {
    return ok({
      sent: true,
      fallback: "SMTP not configured. Configure SMTP_* env vars to send reset links by email.",
      resetUrl,
    });
  }

  return ok({ sent: true });
}
