import { UserRole } from "@prisma/client";
import { getSessionFromCookie } from "@/lib/auth";
import { fail } from "@/lib/api-response";

export async function requireRole(roles: UserRole[]) {
  const session = await getSessionFromCookie();
  // #region agent log
  fetch('http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'51cdae'},body:JSON.stringify({sessionId:'51cdae',runId:'site-debug',hypothesisId:'H2',location:'lib/rbac.ts:requireRole',message:'rbac_check',data:{hasSession:Boolean(session),role:session?.user.role ?? null,roleAllowed:session ? roles.includes(session.user.role) : false},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  if (!session) {
    return { error: fail("Unauthorized", 401) };
  }
  if (!roles.includes(session.user.role)) {
    return { error: fail("Forbidden", 403) };
  }
  return { user: session.user };
}
