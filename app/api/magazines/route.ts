import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { magazineSchema, paginationSchema } from "@/lib/schemas";
import { requireRole } from "@/lib/rbac";
import { UserRole } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parsedQuery = paginationSchema.safeParse({
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 12,
      search: searchParams.get("search") ?? searchParams.get("title") ?? undefined,
    });
    if (!parsedQuery.success) return fail("Invalid query params", 400);
    const { page, limit, search } = parsedQuery.data;

    const where = search
      ? {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } },
            { category: { contains: search } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.magazine.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: "desc" },
      }),
      prisma.magazine.count({ where }),
    ]);

    return ok({
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return fail("Failed to fetch magazines", 500);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const parsed = magazineSchema.safeParse(body);
    if (!parsed.success) return fail("Invalid payload", 400, parsed.error.flatten());

    const created = await prisma.magazine.create({ data: parsed.data });
    return ok(created, { status: 201 });
  } catch {
    return fail("Failed to create magazine", 500);
  }
}
