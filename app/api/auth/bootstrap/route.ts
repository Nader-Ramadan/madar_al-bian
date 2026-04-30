import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { hashPassword } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export async function POST() {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: UserRole.ADMIN },
    });
    if (existingAdmin) return fail("Admin user already exists", 409);

    const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
    const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
    const name = process.env.BOOTSTRAP_ADMIN_NAME ?? "System Admin";

    if (!email || !password) {
      return fail("Bootstrap env vars are missing", 400);
    }

    const passwordHash = await hashPassword(password);
    const admin = await prisma.user.create({
      data: { email, name, passwordHash, role: UserRole.ADMIN },
    });
    return ok({ id: admin.id, email: admin.email, role: admin.role });
  } catch {
    return fail("Failed to bootstrap admin", 500);
  }
}
