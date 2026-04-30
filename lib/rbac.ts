import { UserRole } from "@prisma/client";
import { getSessionFromCookie } from "@/lib/auth";
import { fail } from "@/lib/api-response";

export async function requireRole(roles: UserRole[]) {
  const session = await getSessionFromCookie();
  if (!session) {
    return { error: fail("Unauthorized", 401) };
  }
  if (!roles.includes(session.user.role)) {
    return { error: fail("Forbidden", 403) };
  }
  return { user: session.user };
}
