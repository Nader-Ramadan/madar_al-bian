import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import { refundPublicationRequestPayment } from "@/lib/payment-refund";

function parseId(value: string) {
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole([UserRole.ADMIN]);
  if (auth.error) return auth.error;

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return fail("Invalid id", 400);

  const body = (await request.json().catch(() => ({}))) as { action?: string };
  if (body.action !== "retry-refund") return fail("إجراء غير مدعوم.", 400);

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { publicationRequest: true },
  });
  if (!payment?.publicationRequest) return fail("المعاملة غير موجودة.", 404);
  if (payment.publicationRequest.status !== "REJECTED") {
    return fail("الاسترداد متاح فقط للطلبات المرفوضة.", 400);
  }

  const result = await refundPublicationRequestPayment(payment.publicationRequestId);
  if (!result.ok) return fail(result.error, 500);

  const refreshed = await prisma.payment.findUnique({ where: { id } });
  return ok({ payment: refreshed, refund: result });
}
