import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import { parseMagazineId } from "@/lib/magazine-id";
import { magazinePublishingConditionTabBodySchema } from "@/lib/schemas";

function parseTabId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; tabId: string }> },
) {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;

  const { id: rawMagazine, tabId: rawTab } = await params;
  const magazineId = parseMagazineId(rawMagazine);
  const tabId = parseTabId(rawTab);
  if (!magazineId || !tabId) return fail("Invalid id", 400);

  const existing = await prisma.magazinePublishingConditionTab.findFirst({
    where: { id: tabId, magazineId },
    select: { id: true },
  });
  if (!existing) return fail("Publishing condition tab not found", 404);

  const parsed = magazinePublishingConditionTabBodySchema.safeParse(await request.json());
  if (!parsed.success) return fail("Invalid payload", 400, parsed.error.flatten());

  const updated = await prisma.magazinePublishingConditionTab.update({
    where: { id: tabId },
    data: {
      title: parsed.data.title.trim(),
      body: parsed.data.body.trim(),
      iconKey: parsed.data.iconKey,
      sortOrder: parsed.data.sortOrder ?? 0,
    },
  });
  return ok(updated);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string; tabId: string }> },
) {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;

  const { id: rawMagazine, tabId: rawTab } = await params;
  const magazineId = parseMagazineId(rawMagazine);
  const tabId = parseTabId(rawTab);
  if (!magazineId || !tabId) return fail("Invalid id", 400);

  const existing = await prisma.magazinePublishingConditionTab.findFirst({
    where: { id: tabId, magazineId },
    select: { id: true },
  });
  if (!existing) return fail("Publishing condition tab not found", 404);

  await prisma.magazinePublishingConditionTab.delete({ where: { id: tabId } });
  return ok({ deleted: true });
}
