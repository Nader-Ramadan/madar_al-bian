import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import { advisoryCommitteeDisplaySchema } from "@/lib/schemas";

export async function PUT(request: NextRequest) {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;

  const parsed = advisoryCommitteeDisplaySchema.safeParse(await request.json());
  if (!parsed.success) return fail("Invalid payload", 400, parsed.error.flatten());

  const memberIds = Array.from(new Set(parsed.data.memberIds));

  if (memberIds.length > 0) {
    const count = await prisma.advisoryMember.count({ where: { id: { in: memberIds } } });
    if (count !== memberIds.length) {
      return fail("One or more advisory members were not found", 400);
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.advisoryMember.updateMany({
      data: { featuredOnCommittee: false, committeeSortOrder: 0 },
    });
    for (let index = 0; index < memberIds.length; index++) {
      await tx.advisoryMember.update({
        where: { id: memberIds[index] },
        data: { featuredOnCommittee: true, committeeSortOrder: index },
      });
    }
  });

  return ok({ memberIds });
}
