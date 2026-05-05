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
        include: {
          approvedAdvisors: {
            include: {
              advisoryMember: {
                select: { id: true, name: true, title: true },
              },
            },
          },
        },
      }),
      prisma.magazine.count({ where }),
    ]);

    return ok({
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[GET /api/magazines]", err);
    const msg = err instanceof Error ? err.message : String(err);

    if (msg.includes("Database URL is not configured")) {
      return fail(
        "Database URL is not configured. Set DATABASE_URL (or DB_HOST, DB_USER, DB_PASSWORD, DB_NAME) in the hosting environment.",
        503,
      );
    }

    if (
      msg.includes("Can't reach database server") ||
      msg.includes("P1001") ||
      msg.includes("ECONNREFUSED") ||
      msg.includes("ETIMEDOUT")
    ) {
      return fail(
        "Cannot reach the database server. Check DATABASE_URL, firewall rules, and that the database allows connections from your host (e.g. Vercel).",
        503,
      );
    }

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

    const { approvedAdvisorIds: rawApprovedAdvisorIds, ...magazineData } = parsed.data;
    const approvedAdvisorIds = Array.from(new Set(rawApprovedAdvisorIds ?? []));
    if (approvedAdvisorIds.length > 0) {
      const count = await prisma.advisoryMember.count({
        where: { id: { in: approvedAdvisorIds } },
      });
      if (count !== approvedAdvisorIds.length) {
        return fail("One or more approved advisors were not found", 400);
      }
    }

    const created = await prisma.$transaction(async (tx) => {
      const magazine = await tx.magazine.create({
        data: {
          ...magazineData,
          advisorsApproved: approvedAdvisorIds.length > 0,
        },
      });

      if (approvedAdvisorIds.length > 0) {
        await tx.magazineApprovedAdvisor.createMany({
          data: approvedAdvisorIds.map((advisoryMemberId) => ({
            magazineId: magazine.id,
            advisoryMemberId,
          })),
          skipDuplicates: true,
        });
      }

      return tx.magazine.findUnique({
        where: { id: magazine.id },
        include: {
          approvedAdvisors: {
            include: {
              advisoryMember: {
                select: { id: true, name: true, title: true },
              },
            },
          },
        },
      });
    });
    return ok(created, { status: 201 });
  } catch {
    return fail("Failed to create magazine", 500);
  }
}
