import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { publicationRequestSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  const parsed = publicationRequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return fail("Invalid payload", 400, parsed.error.flatten());
  }
  const data = parsed.data;
  if (data.magazineId != null) {
    const mag = await prisma.magazine.findUnique({
      where: { id: data.magazineId },
      select: { id: true },
    });
    if (!mag) return fail("المجلة غير موجودة", 400);
  }
  const created = await prisma.publicationRequest.create({ data });
  return ok(created, { status: 201 });
}
