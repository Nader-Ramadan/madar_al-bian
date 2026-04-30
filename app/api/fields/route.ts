import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { fieldSchema, paginationSchema } from "@/lib/schemas";
import { requireRole } from "@/lib/rbac";
import { UserRole } from "@prisma/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parsedQuery = paginationSchema.safeParse({
    page: searchParams.get("page") ?? 1,
    limit: searchParams.get("limit") ?? 20,
    search: searchParams.get("search") ?? undefined,
  });
  if (!parsedQuery.success) return fail("Invalid query params", 400);
  const { page, limit, search } = parsedQuery.data;
  const where = search
    ? {
        OR: [{ name: { contains: search } }, { description: { contains: search } }],
      }
    : {};
  const [items, total] = await Promise.all([
    prisma.field.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { id: "desc" } }),
    prisma.field.count({ where }),
  ]);
  return ok({ items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}

export async function POST(request: NextRequest) {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;
  const parsed = fieldSchema.safeParse(await request.json());
  if (!parsed.success) return fail("Invalid payload", 400, parsed.error.flatten());
  const created = await prisma.field.create({ data: parsed.data });
  return ok(created, { status: 201 });
}
