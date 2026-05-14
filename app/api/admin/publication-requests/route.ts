import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import { publicationRequestSchema } from "@/lib/schemas";

export async function GET() {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;
  const items = await prisma.publicationRequest.findMany({
    orderBy: { createdAt: "desc" },
  });
  const magazineIds = [
    ...new Set(
      items.map((row) => row.magazineId).filter((id): id is number => typeof id === "number" && id > 0),
    ),
  ];
  const magazines =
    magazineIds.length === 0
      ? []
      : await prisma.magazine.findMany({
          where: { id: { in: magazineIds } },
          select: { id: true, title: true },
        });
  const magazineById = new Map(magazines.map((m) => [m.id, m]));
  const withMagazine = items.map((row) => ({
    ...row,
    magazine: row.magazineId != null ? magazineById.get(row.magazineId) ?? null : null,
  }));
  return ok(withMagazine);
}

export async function POST(request: NextRequest) {
  const parsed = publicationRequestSchema.safeParse(await request.json());
  if (!parsed.success) return fail("Invalid payload", 400, parsed.error.flatten());
  const created = await prisma.publicationRequest.create({ data: parsed.data });
  return ok(created, { status: 201 });
}
