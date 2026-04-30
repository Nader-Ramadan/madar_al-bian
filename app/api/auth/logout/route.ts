import { getSessionFromCookie, deleteDbSession, clearSessionCookie } from "@/lib/auth";
import { ok } from "@/lib/api-response";

export async function POST() {
  const session = await getSessionFromCookie();
  if (session?.token) {
    await deleteDbSession(session.token);
  }
  await clearSessionCookie();
  return ok({ loggedOut: true });
}
