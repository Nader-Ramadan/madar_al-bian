import { NextRequest } from "next/server";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import { magazineAdvisorUploadPresignSchema } from "@/lib/schemas";
import { createUploadUrl, saveLocalObject } from "@/lib/storage";
import { getStorageDriver } from "@/lib/storage-driver";
import { isAllowedImageMime } from "@/lib/multipart-upload";

const advisorMultipartMeta = z.object({
  magazineId: z.coerce.number().int().positive(),
});

export async function POST(request: NextRequest) {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;

  if (getStorageDriver() === "local") {
    const hdr = request.headers.get("content-type") || "";
    if (!hdr.includes("multipart/form-data")) {
      return fail("Expected multipart/form-data with field file", 400);
    }
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) return fail("Missing file", 400);
    if (!isAllowedImageMime(file)) return fail("Only JPEG, PNG, or WebP images are allowed", 400);
    if (file.size > 5 * 1024 * 1024) return fail("File too large", 400);

    const metaParsed = advisorMultipartMeta.safeParse({ magazineId: form.get("magazineId") });
    if (!metaParsed.success) return fail("Invalid payload", 400, metaParsed.error.flatten());

    const { magazineId } = metaParsed.data;
    const magazine = await prisma.magazine.findUnique({
      where: { id: magazineId },
      select: { id: true },
    });
    if (!magazine) return fail("Magazine not found", 404);

    const safe = file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
    const base = safe.length > 0 ? safe : "photo";
    const storageKey = `magazine-advisors/${magazineId}/${Date.now()}-${base}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileUrl = await saveLocalObject(storageKey, buffer, file.type || "image/jpeg");
    return ok({ fileUrl, expectedSize: file.size });
  }

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
