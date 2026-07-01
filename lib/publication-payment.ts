import { randomUUID } from "node:crypto";
import type { Magazine, Payment, PublicationRequest } from "@prisma/client";

const PAYMENT_TOKEN_TTL_DAYS = 7;

export function createPaymentAccessToken(): string {
  return randomUUID().replace(/-/g, "");
}

export function paymentTokenExpiresAt(): Date {
  const d = new Date();
  d.setDate(d.getDate() + PAYMENT_TOKEN_TTL_DAYS);
  return d;
}

export function isPaymentTokenValid(request: {
  paymentAccessToken: string | null;
  paymentTokenExpiresAt: Date | null;
}): boolean {
  if (!request.paymentAccessToken) return false;
  if (!request.paymentTokenExpiresAt) return true;
  return request.paymentTokenExpiresAt.getTime() > Date.now();
}

export type PublicationRequestSummary = {
  id: number;
  authorName: string;
  authorEmail: string;
  authorPhone: string | null;
  title: string;
  abstract: string;
  status: PublicationRequest["status"];
  magazineId: number | null;
  magazineTitle: string | null;
  createdAt: string;
  paymentAccessToken: string | null;
  fee: {
    enabled: boolean;
    amount: string;
    currency: string;
    label: string;
  } | null;
  payment: {
    id: number;
    status: Payment["status"];
    amount: string;
    currency: string;
    paypalCaptureId: string | null;
    paypalRefundId: string | null;
    payerEmail: string | null;
    payerName: string | null;
  } | null;
};

export function serializePublicationRequestSummary(
  request: PublicationRequest & { magazine?: Pick<Magazine, "title"> | null; payment?: Payment | null },
  fee: { enabled: boolean; amount: string; currency: string; label: string } | null,
): PublicationRequestSummary {
  return {
    id: request.id,
    authorName: request.authorName,
    authorEmail: request.authorEmail,
    authorPhone: request.authorPhone,
    title: request.title,
    abstract: request.abstract,
    status: request.status,
    magazineId: request.magazineId,
    magazineTitle: request.magazine?.title ?? null,
    createdAt: request.createdAt.toISOString(),
    paymentAccessToken: request.paymentAccessToken,
    fee,
    payment: request.payment
      ? {
          id: request.payment.id,
          status: request.payment.status,
          amount: request.payment.amount.toString(),
          currency: request.payment.currency,
          paypalCaptureId: request.payment.paypalCaptureId,
          paypalRefundId: request.payment.paypalRefundId,
          payerEmail: request.payment.payerEmail,
          payerName: request.payment.payerName,
        }
      : null,
  };
}
