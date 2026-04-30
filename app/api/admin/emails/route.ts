import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";

export async function GET() {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;
  const logs = await prisma.emailLog.findMany({ orderBy: { sentAt: "desc" }, take: 100 });
  return ok(logs);
}
