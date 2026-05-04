import { getSessionFromCookie } from "@/lib/auth";
import { ok, fail } from "@/lib/api-response";

export async function GET() {
  const session = await getSessionFromCookie();
  if (!session) return fail("Unauthorized", 401);
  return ok({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  });
}
