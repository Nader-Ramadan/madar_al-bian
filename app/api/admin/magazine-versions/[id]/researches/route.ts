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

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;

  const { id: raw } = await params;
  const magazineVersionId = parseId(raw);
  if (!magazineVersionId) return fail("Invalid version id", 400);

  const version = await prisma.magazineVersion.findUnique({
    where: { id: magazineVersionId },
    select: { id: true },
  });
  if (!version) return fail("Version not found", 404);

  const items = await prisma.magazineVersionResearch.findMany({
    where: { magazineVersionId },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  return ok(items);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;

  const { id: raw } = await params;
  const magazineVersionId = parseId(raw);
  if (!magazineVersionId) return fail("Invalid version id", 400);

  const version = await prisma.magazineVersion.findUnique({
    where: { id: magazineVersionId },
    select: { id: true },
  });
  if (!version) return fail("Version not found", 404);

  const parsed = magazineVersionResearchBodySchema.safeParse(await request.json());
  if (!parsed.success) return fail("Invalid payload", 400, parsed.error.flatten());

  const created = await prisma.magazineVersionResearch.create({
    data: {
      magazineVersionId,
      researcherNames: parsed.data.researcherNames.trim(),
      title: parsed.data.title.trim(),
      externalUrl: parsed.data.externalUrl.trim(),
      summary: parsed.data.summary?.trim() || null,
      keywords: parsed.data.keywords?.trim() || null,
      pdfUrl: parsed.data.pdfUrl?.trim() || null,
      sortOrder: parsed.data.sortOrder ?? 0,
    },
  });
  return ok(created, { status: 201 });
}
