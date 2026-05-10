import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { parseMagazineId } from "@/lib/magazine-id";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
