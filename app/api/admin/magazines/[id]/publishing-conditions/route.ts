import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import { parseMagazineId } from "@/lib/magazine-id";
import { magazinePublishingConditionTabBodySchema } from "@/lib/schemas";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;

  const { id: raw } = await params;
  const magazineId = parseMagazineId(raw);
  if (!magazineId) return fail("Invalid magazine id", 400);

  const magazine = await prisma.magazine.findUnique({
    where: { id: magazineId },
    select: { id: true },
  });
  if (!magazine) return fail("Magazine not found", 404);

  const items = await prisma.magazinePublishingConditionTab.findMany({
    where: { magazineId },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  return ok(items);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;

  const { id: raw } = await params;
  const magazineId = parseMagazineId(raw);
  if (!magazineId) return fail("Invalid magazine id", 400);

  const magazine = await prisma.magazine.findUnique({
    where: { id: magazineId },
    select: { id: true },
  });
  if (!magazine) return fail("Magazine not found", 404);

  const parsed = magazinePublishingConditionTabBodySchema.safeParse(await request.json());
  if (!parsed.success) return fail("Invalid payload", 400, parsed.error.flatten());

  const created = await prisma.magazinePublishingConditionTab.create({
    data: {
      magazineId,
      title: parsed.data.title.trim(),
      body: parsed.data.body.trim(),
      iconKey: parsed.data.iconKey,
      sortOrder: parsed.data.sortOrder ?? 0,
    },
  });
  return ok(created, { status: 201 });
}
