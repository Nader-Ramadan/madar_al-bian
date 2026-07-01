import { NextRequest } from "next/server";
import { PaymentStatus, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import { transactionsQuerySchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;

  const parsed = transactionsQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  );
  if (!parsed.success) return fail("Invalid query", 400, parsed.error.flatten());

  const { page, limit, status, search } = parsed.data;
  const where: {
    status?: PaymentStatus;
    OR?: Array<{
      payerEmail?: { contains: string };
      publicationRequest?: {
        OR: Array<{ authorEmail?: { contains: string }; title?: { contains: string } }>;
      };
    }>;
  } = {};

  if (status) where.status = status;
  if (search?.trim()) {
    const q = search.trim();
    where.OR = [
      { payerEmail: { contains: q } },
      {
        publicationRequest: {
          OR: [{ authorEmail: { contains: q } }, { title: { contains: q } }],
        },
      },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        publicationRequest: {
          select: {
            id: true,
            title: true,
            authorName: true,
            authorEmail: true,
            status: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return ok({
    items: items.map((p) => ({
      id: p.id,
      status: p.status,
      amount: p.amount.toString(),
      currency: p.currency,
      payerEmail: p.payerEmail,
      payerName: p.payerName,
      paypalOrderId: p.paypalOrderId,
      paypalCaptureId: p.paypalCaptureId,
      paypalRefundId: p.paypalRefundId,
      refundError: p.refundError,
      createdAt: p.createdAt.toISOString(),
      publicationRequest: p.publicationRequest
        ? {
            ...p.publicationRequest,
            createdAt: p.publicationRequest.createdAt.toISOString(),
          }
        : null,
    })),
    page,
    limit,
    total,
  });
}
