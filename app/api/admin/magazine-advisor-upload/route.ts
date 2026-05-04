import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import { magazineAdvisorUploadPresignSchema } from "@/lib/schemas";
import { createUploadUrl } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;

  const parsed = magazineAdvisorUploadPresignSchema.safeParse(await request.json());
  if (!parsed.success) return fail("Invalid payload", 400, parsed.error.flatten());

  const { magazineId, filename, contentType, size } = parsed.data;

  const magazine = await prisma.magazine.findUnique({
    where: { id: magazineId },
    select: { id: true },
  });
  if (!magazine) return fail("Magazine not found", 404);

  const safe = filename.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
  const base = safe.length > 0 ? safe : "photo";
  const key = `magazine-advisors/${magazineId}/${Date.now()}-${base}`;

  const presigned = await createUploadUrl(key, contentType);
  return ok({
    key,
    uploadUrl: presigned.uploadUrl,
    fileUrl: presigned.fileUrl,
    expectedSize: size,
  });
}
