import { NextRequest } from "next/server";
import { EmailStatus, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import { transactionEmailSchema } from "@/lib/schemas";
import { sendEmail } from "@/lib/mailer";

function parseId(value: string) {
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return fail("Invalid id", 400);

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      publicationRequest: {
        select: { authorEmail: true, authorName: true, title: true },
      },
    },
  });
  if (!payment) return fail("المعاملة غير موجودة.", 404);

  const parsed = transactionEmailSchema.safeParse(await request.json());
  if (!parsed.success) return fail("بيانات غير صالحة", 400, parsed.error.flatten());

  const to =
    parsed.data.to ??
    payment.payerEmail ??
    payment.publicationRequest.authorEmail;

  try {
    await sendEmail(to, parsed.data.subject, parsed.data.body);
    const logged = await prisma.emailLog.create({
      data: {
        to,
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
        to,
        subject: parsed.data.subject,
        body: parsed.data.body,
        status: EmailStatus.FAILED,
        error: error instanceof Error ? error.message : "Unknown email error",
        sentById: auth.user?.id,
      },
    });
    return fail("تعذر إرسال البريد", 500, { id: logged.id });
  }
}
