import { NextRequest } from "next/server";
import { PaymentStatus, PublicationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { checkRateLimit } from "@/lib/rate-limit";
import { paymentCaptureSchema } from "@/lib/schemas";
import { capturePayPalOrder } from "@/lib/paypal";
import { sendPaymentReceiptEmail } from "@/lib/payment-receipt-email";
import {
  isPaymentTokenValid,
  serializePublicationRequestSummary,
} from "@/lib/publication-payment";
import { formatFeeDisplay, getPublicationFee } from "@/lib/publication-fee";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limit = checkRateLimit(`payment-capture:${ip}`);
  if (!limit.allowed) return fail("طلبات كثيرة. حاول لاحقاً.", 429);

  const parsed = paymentCaptureSchema.safeParse(await request.json());
  if (!parsed.success) return fail("بيانات غير صالحة", 400, parsed.error.flatten());

  const row = await prisma.publicationRequest.findUnique({
    where: { id: parsed.data.publicationRequestId },
    include: { payment: true, magazine: { select: { title: true } } },
  });
  if (!row) return fail("الطلب غير موجود.", 404);
  if (row.paymentAccessToken !== parsed.data.paymentAccessToken) {
    return fail("رمز الدفع غير صالح.", 403);
  }
  if (!isPaymentTokenValid(row)) return fail("انتهت صلاحية رابط الدفع.", 410);
  if (!row.payment || row.payment.paypalOrderId !== parsed.data.orderId) {
    return fail("طلب الدفع غير متطابق.", 400);
  }

  if (row.payment.status === PaymentStatus.COMPLETED) {
    const fee = await getPublicationFee();
    return ok({
      summary: serializePublicationRequestSummary(row, {
        enabled: fee.enabled,
        amount: fee.amount,
        currency: fee.currency,
        label: formatFeeDisplay(fee),
      }),
    });
  }

  const capture = await capturePayPalOrder(parsed.data.orderId);

  await prisma.payment.update({
    where: { id: row.payment.id },
    data: {
      status: PaymentStatus.COMPLETED,
      paypalCaptureId: capture.captureId,
      payerEmail: capture.payerEmail,
      payerName: capture.payerName,
    },
  });
  await prisma.publicationRequest.update({
    where: { id: row.id },
    data: { status: PublicationStatus.PENDING },
  });

  const withPayment = await prisma.publicationRequest.findUnique({
    where: { id: row.id },
    include: { payment: true, magazine: { select: { title: true } } },
  });

  try {
    await sendPaymentReceiptEmail({
      to: row.authorEmail,
      authorName: row.authorName,
      requestId: row.id,
      studyTitle: row.title,
      amount: capture.amount,
      currency: capture.currency,
      captureId: capture.captureId,
    });
  } catch (error) {
    console.error("[payment-capture] receipt email failed:", error);
  }

  const fee = await getPublicationFee();
  return ok({
    summary: serializePublicationRequestSummary(withPayment!, {
      enabled: fee.enabled,
      amount: fee.amount,
      currency: fee.currency,
      label: formatFeeDisplay(fee),
    }),
  });
}
