import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { magazineSchema } from "@/lib/schemas";
import { requireRole } from "@/lib/rbac";
import { UserRole } from "@prisma/client";

function parseId(value: string) {
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return fail("Invalid id");

  const item = await prisma.magazine.findUnique({ where: { id } });
  if (!item) return fail("Magazine not found", 404);
  return ok(item);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return fail("Invalid id");

  const body = await request.json();
  const parsed = magazineSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid payload", 400, parsed.error.flatten());

  const item = await prisma.magazine.update({ where: { id }, data: parsed.data });
  return ok(item);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole([UserRole.ADMIN]);
  if (auth.error) return auth.error;
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return fail("Invalid id");

  await prisma.magazine.delete({ where: { id } });
  return ok({ deleted: true });
}
