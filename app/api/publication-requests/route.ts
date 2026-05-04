import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { publicationRequestSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  const parsed = publicationRequestSchema.safeParse(await request.json());
  if (!parsed.success) return fail("Invalid payload", 400, parsed.error.flatten());
  const created = await prisma.publicationRequest.create({ data: parsed.data });
  return ok(created, { status: 201 });
}
