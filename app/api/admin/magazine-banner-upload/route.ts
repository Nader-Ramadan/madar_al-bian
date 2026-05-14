import { NextRequest } from "next/server";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import { magazineBannerUploadPresignSchema } from "@/lib/schemas";
import { createUploadUrl, saveLocalObject } from "@/lib/storage";
import { getStorageDriver } from "@/lib/storage-driver";
import { isAllowedImageMime } from "@/lib/multipart-upload";

function safeSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
}

const bannerMultipartMeta = z.object({
  magazineId: z.coerce.number().int().positive().optional(),
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
    if (file.size > 8 * 1024 * 1024) return fail("File too large", 400);

    const metaParsed = bannerMultipartMeta.safeParse({
      magazineId: form.get("magazineId") || undefined,
    });
    if (!metaParsed.success) return fail("Invalid payload", 400, metaParsed.error.flatten());

    const { magazineId } = metaParsed.data;
    if (magazineId) {
      const exists = await prisma.magazine.findUnique({
        where: { id: magazineId },
        select: { id: true },
      });
      if (!exists) return fail("Magazine not found", 404);
    }

    const ext = filenameExt(file.name);
    const baseName = filenameBase(file.name, ext);
    const storageKey = `magazines/${magazineId ?? "new"}/banner-${Date.now()}-${safeSlug(baseName)}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileUrl = await saveLocalObject(storageKey, buffer, file.type || "image/jpeg");
    return ok({ fileUrl });
  }

  const parsed = magazineBannerUploadPresignSchema.safeParse(await request.json());
  if (!parsed.success) return fail("Invalid payload", 400, parsed.error.flatten());

  const { magazineId, filename, contentType } = parsed.data;
  if (magazineId) {
    const exists = await prisma.magazine.findUnique({
      where: { id: magazineId },
      select: { id: true },
    });
    if (!exists) return fail("Magazine not found", 404);
  }

  const ext = filename.includes(".") ? filename.slice(filename.lastIndexOf(".")).toLowerCase() : "";
  const baseName = ext ? filename.slice(0, filename.length - ext.length) : filename;
  const key = `magazines/${magazineId ?? "new"}/banner-${Date.now()}-${safeSlug(baseName)}${ext}`;
  const signed = await createUploadUrl(key, contentType);
  return ok(signed);
}

function filenameExt(name: string) {
  return name.includes(".") ? name.slice(name.lastIndexOf(".")).toLowerCase() : "";
}

function filenameBase(name: string, ext: string) {
  return ext ? name.slice(0, name.length - ext.length) : name;
}
