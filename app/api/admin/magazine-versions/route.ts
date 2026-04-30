import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import { magazineVersionSchema } from "@/lib/schemas";

export async function GET() {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;
  const items = await prisma.magazineVersion.findMany({
    include: { magazine: { select: { title: true } } },
    orderBy: { releaseDate: "desc" },
  });
  return ok(items);
}

export async function POST(request: NextRequest) {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;
  const parsed = magazineVersionSchema.safeParse(await request.json());
  if (!parsed.success) return fail("Invalid payload", 400, parsed.error.flatten());

  const created = await prisma.magazineVersion.create({
    data: {
      ...parsed.data,
      releaseDate: new Date(parsed.data.releaseDate),
    },
  });
  return ok(created, { status: 201 });
}
