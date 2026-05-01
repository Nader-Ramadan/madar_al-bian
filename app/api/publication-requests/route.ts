import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { publicationRequestSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  // #region agent log
  fetch('http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'51cdae'},body:JSON.stringify({sessionId:'51cdae',runId:'pre-fix',location:'app/api/publication-requests/route.ts:POST',message:'publication_api_entry',data:{hasBody:Boolean(request.headers.get('content-type'))},timestamp:Date.now(),hypothesisId:'H6'})}).catch(()=>{});
  // #endregion
  const parsed = publicationRequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    // #region agent log
    fetch('http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'51cdae'},body:JSON.stringify({sessionId:'51cdae',runId:'pre-fix',location:'app/api/publication-requests/route.ts:POST',message:'publication_api_invalid_payload',data:{issues:parsed.error.issues.length},timestamp:Date.now(),hypothesisId:'H5'})}).catch(()=>{});
    // #endregion
    return fail("Invalid payload", 400, parsed.error.flatten());
  }
  const created = await prisma.publicationRequest.create({ data: parsed.data });
  // #region agent log
  fetch('http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'51cdae'},body:JSON.stringify({sessionId:'51cdae',runId:'pre-fix',location:'app/api/publication-requests/route.ts:POST',message:'publication_api_success',data:{id:created.id},timestamp:Date.now(),hypothesisId:'H5'})}).catch(()=>{});
  // #endregion
  return ok(created, { status: 201 });
}
