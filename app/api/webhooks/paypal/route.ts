import { NextRequest } from "next/server";
import { PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api-response";
import { parsePayPalWebhookHeaders, stableWebhookEventId, verifyPayPalWebhook } from "@/lib/paypal";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headers = parsePayPalWebhookHeaders(request.headers);

  if (headers && process.env.PAYPAL_WEBHOOK_ID) {
    const valid = await verifyPayPalWebhook(headers, body);
    if (!valid) {
      return new Response("Invalid signature", { status: 401 });
    }
  }

  let event: {
    event_type?: string;
    resource?: {
      id?: string;
      supplementary_data?: { related_ids?: { order_id?: string } };
      amount?: { value?: string; currency_code?: string };
    };
  };

  try {
    event = JSON.parse(body);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const eventType = event.event_type ?? "";
  const resourceId = event.resource?.id;
  const orderId = event.resource?.supplementary_data?.related_ids?.order_id;

  if (eventType === "PAYMENT.CAPTURE.COMPLETED" && resourceId) {
    await prisma.payment.updateMany({
      where: {
        OR: [{ paypalCaptureId: resourceId }, { paypalOrderId: orderId ?? "" }],
        status: PaymentStatus.PENDING,
      },
      data: {
        status: PaymentStatus.COMPLETED,
        paypalCaptureId: resourceId,
      },
    });
  }

  if (eventType === "PAYMENT.CAPTURE.DENIED" && resourceId) {
    await prisma.payment.updateMany({
      where: { paypalCaptureId: resourceId },
      data: { status: PaymentStatus.FAILED },
    });
  }

  if (eventType === "PAYMENT.CAPTURE.REFUNDED" && resourceId) {
    await prisma.payment.updateMany({
      where: { paypalCaptureId: resourceId },
      data: {
        status: PaymentStatus.REFUNDED,
        paypalRefundId: resourceId,
        refundError: null,
      },
    });
  }

  return ok({ received: true, eventId: stableWebhookEventId(body) });
}
