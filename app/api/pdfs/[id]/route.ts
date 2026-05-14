import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import { UserRole } from "@prisma/client";
import { deleteStoredFile } from "@/lib/storage";

function parseId(value: string) {
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return fail("Invalid id");
  const pdf = await prisma.pdf.findUnique({ where: { id } });
  if (!pdf) return fail("PDF not found", 404);
  return ok(pdf);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole([UserRole.ADMIN]);
  if (auth.error) return auth.error;
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return fail("Invalid id");
  const pdf = await prisma.pdf.findUnique({ where: { id } });
  if (!pdf) return fail("PDF not found", 404);

  await deleteStoredFile(pdf.filepath);

  await prisma.pdf.delete({ where: { id } });
  return ok({ deleted: true });
}
