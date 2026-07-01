import { NextRequest } from "next/server";
import { PublicationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { checkRateLimit } from "@/lib/rate-limit";
import { paymentCreateOrderSchema } from "@/lib/schemas";
import { createPayPalOrder } from "@/lib/paypal";
import { formatFeeDisplay, getPublicationFeeForPayment } from "@/lib/publication-fee";
import { isPaymentTokenValid } from "@/lib/publication-payment";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limit = checkRateLimit(`payment-create:${ip}`);
  if (!limit.allowed) return fail("طلبات كثيرة. حاول لاحقاً.", 429);

  const parsed = paymentCreateOrderSchema.safeParse(await request.json());
  if (!parsed.success) return fail("بيانات غير صالحة", 400, parsed.error.flatten());

  const fee = await getPublicationFeeForPayment();
  if (!fee.enabled || fee.amountNumber <= 0) {
    return fail("رسوم النشر غير مفعّلة حالياً.", 400);
  }

  const row = await prisma.publicationRequest.findUnique({
    where: { id: parsed.data.publicationRequestId },
    include: { payment: true },
  });
  if (!row) return fail("الطلب غير موجود.", 404);
  if (row.paymentAccessToken !== parsed.data.paymentAccessToken) {
    return fail("رمز الدفع غير صالح.", 403);
  }
  if (!isPaymentTokenValid(row)) return fail("انتهت صلاحية رابط الدفع.", 410);
  if (row.status !== PublicationStatus.AWAITING_PAYMENT) {
    return fail("هذا الطلب لا يتطلب دفعاً أو تم الدفع مسبقاً.", 400);
  }
  if (row.payment?.status === "COMPLETED") {
    return fail("تم الدفع مسبقاً.", 400);
  }

  const { orderId } = await createPayPalOrder({
    amount: fee.amount,
    currency: fee.currency,
    referenceId: String(row.id),
    description: `رسوم نشر دراسة: ${row.title.slice(0, 120)}`,
  });

  if (row.payment) {
    await prisma.payment.update({
      where: { id: row.payment.id },
      data: {
        paypalOrderId: orderId,
        amount: fee.amount,
        currency: fee.currency,
        status: "PENDING",
      },
    });
  } else {
    await prisma.payment.create({
      data: {
        publicationRequestId: row.id,
        paypalOrderId: orderId,
        amount: fee.amount,
        currency: fee.currency,
        status: "PENDING",
      },
    });
  }

  return ok({
    orderId,
    fee: {
      enabled: fee.enabled,
      amount: fee.amount,
      currency: fee.currency,
      label: formatFeeDisplay(fee),
    },
  });
}
