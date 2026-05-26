import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import { publicationStatusSchema } from "@/lib/schemas";
import { deleteStoredFile } from "@/lib/storage";

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

  const updated = await prisma.publicationRequest.update({
    where: { id },
    data: {
      status: parsed.data.status,
      reviewNotes: parsed.data.reviewNotes,
      reviewedById: auth.user?.id,
    },
  });

  return ok(updated);
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
