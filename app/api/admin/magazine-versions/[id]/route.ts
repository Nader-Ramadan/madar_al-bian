import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import { magazineVersionSchema } from "@/lib/schemas";
import { syncMagazineVersionStats } from "@/lib/magazine-version-sync";

function hasMissingColumnError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("P2022") || message.includes("does not exist in the current database");
}

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
  const parsed = magazineVersionSchema.safeParse(await request.json());
  if (!parsed.success) return fail("Invalid payload", 400, parsed.error.flatten());

  const existing = await prisma.magazineVersion.findUnique({
    where: { id },
    select: { magazineId: true },
  });
  if (!existing) return fail("Not found", 404);

  let updated;
  try {
    updated = await prisma.magazineVersion.update({
      where: { id },
      data: {
        ...parsed.data,
        releaseDate: new Date(parsed.data.releaseDate),
      },
    });
  } catch (error) {
    if (!hasMissingColumnError(error)) return fail("Failed to update version", 500);
    updated = await prisma.magazineVersion.update({
      where: { id },
      data: {
        magazineId: parsed.data.magazineId,
        version: parsed.data.version,
        title: parsed.data.title,
        releaseDate: new Date(parsed.data.releaseDate),
        notes: parsed.data.notes ?? null,
      },
    });
  }
  const ids = new Set([existing.magazineId, parsed.data.magazineId]);
  for (const magazineId of ids) {
    await syncMagazineVersionStats(magazineId);
  }
  return ok(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole([UserRole.ADMIN]);
  if (auth.error) return auth.error;
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return fail("Invalid id", 400);
  const existing = await prisma.magazineVersion.findUnique({
    where: { id },
    select: { magazineId: true },
  });
  if (!existing) return fail("Not found", 404);
  await prisma.magazineVersion.delete({ where: { id } });
  await syncMagazineVersionStats(existing.magazineId);
  return ok({ deleted: true });
}
