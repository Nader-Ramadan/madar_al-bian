import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { advisoryMemberSchema, paginationSchema } from "@/lib/schemas";
import { requireRole } from "@/lib/rbac";
import { UserRole } from "@prisma/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const featuredOnly =
    searchParams.get("featured") === "1" || searchParams.get("committee") === "1";

  if (featuredOnly) {
    try {
      const items = await prisma.advisoryMember.findMany({
        where: { featuredOnCommittee: true },
        orderBy: [{ committeeSortOrder: "asc" }, { id: "asc" }],
        take: 100,
      });
      const total = items.length;
      return ok({
        items,
        pagination: { page: 1, limit: total, total, totalPages: total > 0 ? 1 : 0 },
      });
    } catch (error) {
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? String((error as { code: unknown }).code)
          : "";
      if (code === "P2022") {
        return fail(
          "قاعدة البيانات غير محدّثة (أعمدة اللجنة الاستشارية). شغّل: npx prisma migrate deploy ثم أعد تشغيل الخادم.",
          500,
        );
      }
      throw error;
    }
  }

  const parsedQuery = paginationSchema.safeParse({
    page: searchParams.get("page") ?? 1,
    limit: searchParams.get("limit") ?? 12,
    search: searchParams.get("search") ?? undefined,
  });
  if (!parsedQuery.success) return fail("Invalid query params", 400);
  const { page, limit, search } = parsedQuery.data;
  const where = search
    ? {
        OR: [{ name: { contains: search } }, { title: { contains: search } }, { bio: { contains: search } }],
      }
    : {};
  try {
    const [items, total] = await Promise.all([
      prisma.advisoryMember.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { id: "desc" } }),
      prisma.advisoryMember.count({ where }),
    ]);
    return ok({ items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code: unknown }).code)
        : "";
    if (code === "P2022") {
      return fail(
        "قاعدة البيانات غير محدّثة (أعمدة اللجنة الاستشارية). شغّل: npx prisma migrate deploy ثم أعد تشغيل الخادم.",
        500,
      );
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;
  const parsed = advisoryMemberSchema.safeParse(await request.json());
  if (!parsed.success) return fail("Invalid payload", 400, parsed.error.flatten());
  try {
    const created = await prisma.advisoryMember.create({ data: parsed.data });
    return ok(created, { status: 201 });
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code: unknown }).code)
        : "";
    console.error("Failed to create advisory member", error);
    if (code === "P2022") {
      return fail(
        "قاعدة البيانات غير محدّثة. شغّل: npx prisma migrate deploy ثم أعد المحاولة.",
        500,
      );
    }
    return fail("تعذر إنشاء المستشار. تحقق من البيانات وحاول مرة أخرى.", 500);
  }
}
