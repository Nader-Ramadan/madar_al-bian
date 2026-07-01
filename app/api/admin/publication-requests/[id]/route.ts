import { NextRequest } from "next/server";
import { PublicationStatus, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import { publicationStatusSchema } from "@/lib/schemas";
import { deleteStoredFile } from "@/lib/storage";
import { canApprovePublicationRequest, refundPublicationRequestPayment } from "@/lib/payment-refund";

function parseId(value: string) {
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return fail("Invalid id", 400);

  const parsed = publicationStatusSchema.safeParse(await request.json());
  if (!parsed.success) return fail("Invalid payload", 400, parsed.error.flatten());

  const existing = await prisma.publicationRequest.findUnique({
    where: { id },
    include: { payment: true },
  });
  if (!existing) return fail("Publication request not found", 404);

  if (parsed.data.status === PublicationStatus.APPROVED) {
    const check = await canApprovePublicationRequest(existing);
    if (!check.allowed) return fail(check.reason ?? "لا يمكن الموافقة على هذا الطلب.", 400);
  }

  let refundResult: Awaited<ReturnType<typeof refundPublicationRequestPayment>> | null = null;
  if (parsed.data.status === PublicationStatus.REJECTED) {
    refundResult = await refundPublicationRequestPayment(id, parsed.data.reviewNotes);
    if (!refundResult.ok) {
      return fail(`تم رفض الطلب لكن فشل الاسترداد: ${refundResult.error}`, 500, {
        refund: refundResult,
      });
    }
  }

  const updated = await prisma.publicationRequest.update({
    where: { id },
    data: {
      status: parsed.data.status,
      reviewNotes: parsed.data.reviewNotes,
      reviewedById: auth.user?.id,
    },
    include: { payment: true, magazine: { select: { id: true, title: true } } },
  });

  return ok({ request: updated, refund: refundResult });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole([UserRole.ADMIN]);
  if (auth.error) return auth.error;
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return fail("Invalid id", 400);

  const row = await prisma.publicationRequest.findUnique({ where: { id } });
  if (!row) return fail("Publication request not found", 404);

  if (row.documentUrl) {
    await deleteStoredFile(row.documentUrl);
  }

  await prisma.publicationRequest.delete({ where: { id } });
  return ok({ deleted: true });
}
