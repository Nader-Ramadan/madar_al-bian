import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import { magazineAdvisorCreateSchema } from "@/lib/schemas";

function parseMagazineId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;

  const { id: rawId } = await params;
  const magazineId = parseMagazineId(rawId);
  if (!magazineId) return fail("Invalid id");

  const magazine = await prisma.magazine.findUnique({
    where: { id: magazineId },
    select: { id: true },
  });
  if (!magazine) return fail("Magazine not found", 404);

  const advisors = await prisma.magazineAdvisor.findMany({
    where: { magazineId },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  return ok(advisors);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;

  const { id: rawId } = await params;
  const magazineId = parseMagazineId(rawId);
  if (!magazineId) return fail("Invalid id");

  const magazine = await prisma.magazine.findUnique({
    where: { id: magazineId },
    select: { id: true },
  });
  if (!magazine) return fail("Magazine not found", 404);

  const parsed = magazineAdvisorCreateSchema.safeParse(await request.json());
  if (!parsed.success) return fail("Invalid payload", 400, parsed.error.flatten());

  const agg = await prisma.magazineAdvisor.aggregate({
    where: { magazineId },
    _max: { sortOrder: true },
  });
  const sortOrder = (agg._max.sortOrder ?? -1) + 1;

  const created = await prisma.magazineAdvisor.create({
    data: {
      magazineId,
      name: parsed.data.name,
      jobTitle: parsed.data.jobTitle,
      photoUrl: parsed.data.photoUrl,
      sortOrder,
    },
  });
  // #region agent log
  fetch("http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "51cdae" },
    body: JSON.stringify({
      sessionId: "51cdae",
      location: "api/admin/magazines/[id]/advisors/route.ts:POST",
      message: "MagazineAdvisor created",
      data: {
        magazineId,
        advisorId: created.id,
        name: created.name,
        jobTitle: created.jobTitle.slice(0, 80),
      },
      timestamp: Date.now(),
      hypothesisId: "A",
    }),
  }).catch(() => {});
  // #endregion
  return ok(created, { status: 201 });
}
