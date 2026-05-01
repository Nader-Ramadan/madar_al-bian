import { getSessionFromCookie } from "@/lib/auth";
import { ok, fail } from "@/lib/api-response";

export async function GET() {
  const session = await getSessionFromCookie();
  // #region agent log
  fetch('http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'51cdae'},body:JSON.stringify({sessionId:'51cdae',runId:'pre-fix',location:'app/api/auth/me/route.ts:GET',message:'auth_me_result',data:{hasSession:Boolean(session),userId:session?.user.id ?? null},timestamp:Date.now(),hypothesisId:'H11'})}).catch(()=>{});
  // #endregion
  if (!session) return fail("Unauthorized", 401);
  return ok({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  });
}
