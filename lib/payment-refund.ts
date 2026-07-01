import { PaymentStatus, PublicationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { refundPayPalCapture } from "@/lib/paypal";
import { sendRejectionRefundEmail } from "@/lib/payment-receipt-email";

export type RefundResult =
  | { ok: true; refundId: string; skipped: boolean }
  | { ok: false; error: string };

export async function refundPublicationRequestPayment(
  publicationRequestId: number,
  reviewNotesOverride?: string | null,
): Promise<RefundResult> {
  const payment = await prisma.payment.findUnique({
    where: { publicationRequestId },
    include: {
      publicationRequest: {
        select: {
          authorName: true,
          authorEmail: true,
          title: true,
          reviewNotes: true,
        },
      },
    },
  });

  if (!payment) return { ok: true, refundId: "", skipped: true };
  if (payment.status === PaymentStatus.REFUNDED) {
    return { ok: true, refundId: payment.paypalRefundId ?? "", skipped: true };
  }
  if (payment.status !== PaymentStatus.COMPLETED || !payment.paypalCaptureId) {
    return { ok: true, refundId: "", skipped: true };
  }

  try {
    const { refundId } = await refundPayPalCapture(
      payment.paypalCaptureId,
      payment.amount.toString(),
      payment.currency,
    );

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.REFUNDED,
        paypalRefundId: refundId,
        refundError: null,
      },
    });

    try {
      await sendRejectionRefundEmail({
        to: payment.publicationRequest.authorEmail,
        authorName: payment.publicationRequest.authorName,
        studyTitle: payment.publicationRequest.title,
        amount: payment.amount.toString(),
        currency: payment.currency,
        refundId,
        reviewNotes: reviewNotesOverride ?? payment.publicationRequest.reviewNotes,
      });
    } catch (emailError) {
      console.error("[refund] rejection email failed:", emailError);
    }

    return { ok: true, refundId, skipped: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Refund failed";
    await prisma.payment.update({
      where: { id: payment.id },
      data: { refundError: message },
    });
    return { ok: false, error: message };
  }
}

export async function canApprovePublicationRequest(request: {
  status: PublicationStatus;
  payment: { status: PaymentStatus } | null;
}): Promise<{ allowed: boolean; reason?: string }> {
  if (request.status === PublicationStatus.AWAITING_PAYMENT) {
    return { allowed: false, reason: "الطلب بانتظار إتمام الدفع." };
  }
  if (request.payment && request.payment.status !== PaymentStatus.COMPLETED) {
    if (request.payment.status === PaymentStatus.REFUNDED) {
      return { allowed: false, reason: "تم استرداد المبلغ لهذا الطلب." };
    }
    return { allowed: false, reason: "الدفع غير مكتمل." };
  }
  return { allowed: true };
}
