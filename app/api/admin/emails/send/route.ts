import { NextRequest } from "next/server";
import { EmailStatus, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import { sendEmailSchema } from "@/lib/schemas";
import { sendEmail } from "@/lib/mailer";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;

  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limit = checkRateLimit(`admin-email:${ip}`);
  if (!limit.allowed) return fail("Too many requests. Try again later.", 429);

  const parsed = sendEmailSchema.safeParse(await request.json());
  if (!parsed.success) return fail("Invalid payload", 400, parsed.error.flatten());

  try {
    await sendEmail(parsed.data.to, parsed.data.subject, parsed.data.body);
    const logged = await prisma.emailLog.create({
      data: {
        to: parsed.data.to,
        subject: parsed.data.subject,
        body: parsed.data.body,
        status: EmailStatus.SENT,
        sentById: auth.user?.id,
      },
    });
    return ok(logged, { status: 201 });
  } catch (error) {
    const logged = await prisma.emailLog.create({
      data: {
        to: parsed.data.to,
        subject: parsed.data.subject,
        body: parsed.data.body,
        status: EmailStatus.FAILED,
        error: error instanceof Error ? error.message : "Unknown email error",
        sentById: auth.user?.id,
      },
    });
    return fail("Failed to send email", 500, { id: logged.id });
  }
}
