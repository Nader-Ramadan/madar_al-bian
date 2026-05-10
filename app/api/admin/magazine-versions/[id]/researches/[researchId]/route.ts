import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import { magazineVersionResearchBodySchema } from "@/lib/schemas";

function parseId(value: string) {
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; researchId: string }> },
) {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;

  const { id: rawVersion, researchId: rawResearch } = await params;
  const magazineVersionId = parseId(rawVersion);
  const researchId = parseId(rawResearch);
  if (!magazineVersionId || !researchId) return fail("Invalid id", 400);

  const existing = await prisma.magazineVersionResearch.findFirst({
    where: { id: researchId, magazineVersionId },
    select: { id: true },
  });
  if (!existing) return fail("Research not found", 404);

  const parsed = magazineVersionResearchBodySchema.safeParse(await request.json());
  if (!parsed.success) return fail("Invalid payload", 400, parsed.error.flatten());

  const updated = await prisma.magazineVersionResearch.update({
    where: { id: researchId },
    data: {
      researcherNames: parsed.data.researcherNames.trim(),
      title: parsed.data.title.trim(),
      externalUrl: parsed.data.externalUrl.trim(),
      summary: parsed.data.summary?.trim() || null,
      keywords: parsed.data.keywords?.trim() || null,
      pdfUrl: parsed.data.pdfUrl?.trim() || null,
      sortOrder: parsed.data.sortOrder ?? 0,
    },
  });
  return ok(updated);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string; researchId: string }> },
) {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;

  const { id: rawVersion, researchId: rawResearch } = await params;
  const magazineVersionId = parseId(rawVersion);
  const researchId = parseId(rawResearch);
  if (!magazineVersionId || !researchId) return fail("Invalid id", 400);

  const existing = await prisma.magazineVersionResearch.findFirst({
    where: { id: researchId, magazineVersionId },
    select: { id: true },
  });
  if (!existing) return fail("Research not found", 404);

  await prisma.magazineVersionResearch.delete({ where: { id: researchId } });
  return ok({ deleted: true });
}
