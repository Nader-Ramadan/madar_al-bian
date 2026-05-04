import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";

function parsePositiveInt(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string; advisorId: string }> },
) {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;

  const { id: rawMagazineId, advisorId: rawAdvisorId } = await params;
  const magazineId = parsePositiveInt(rawMagazineId);
  const advisorId = parsePositiveInt(rawAdvisorId);
  if (!magazineId || !advisorId) return fail("Invalid id");

  const existing = await prisma.magazineAdvisor.findFirst({
    where: { id: advisorId, magazineId },
  });
  if (!existing) return fail("Advisor not found", 404);

  await prisma.magazineAdvisor.delete({ where: { id: advisorId } });
  return ok({ deleted: true });
}
