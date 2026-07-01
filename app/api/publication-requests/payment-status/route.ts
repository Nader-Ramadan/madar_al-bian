import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import {
  isPaymentTokenValid,
  serializePublicationRequestSummary,
} from "@/lib/publication-payment";
import { formatFeeDisplay, getPublicationFee } from "@/lib/publication-fee";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim();
  if (!token) return fail("رمز الدفع مطلوب.", 400);

  const row = await prisma.publicationRequest.findUnique({
    where: { paymentAccessToken: token },
    include: { payment: true, magazine: { select: { title: true } } },
  });
  if (!row) return fail("الطلب غير موجود.", 404);
  if (!isPaymentTokenValid(row)) return fail("انتهت صلاحية رابط الدفع.", 410);

  const fee = await getPublicationFee();
  const feePayload = fee.enabled
    ? {
        enabled: fee.enabled,
        amount: fee.amount,
        currency: fee.currency,
        label: formatFeeDisplay(fee),
      }
    : null;

  return ok({
    summary: serializePublicationRequestSummary(row, feePayload),
    needsPayment: row.status === "AWAITING_PAYMENT" && fee.enabled,
  });
}
