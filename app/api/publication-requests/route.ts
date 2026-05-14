import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { publicationRequestSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  const parsed = publicationRequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    // #region agent log
    fetch('http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'51cdae'},body:JSON.stringify({sessionId:'51cdae',runId:'site-debug',hypothesisId:'H4',location:'app/api/publication-requests/route.ts:POST',message:'publication_invalid_payload',data:{issueCount:parsed.error.issues.length},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return fail("Invalid payload", 400, parsed.error.flatten());
  }
  const created = await prisma.publicationRequest.create({ data: parsed.data });
  // #region agent log
  fetch('http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'51cdae'},body:JSON.stringify({sessionId:'51cdae',runId:'site-debug',hypothesisId:'H4',location:'app/api/publication-requests/route.ts:POST',message:'publication_created',data:{id:created.id},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  return ok(created, { status: 201 });
}
