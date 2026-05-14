import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import { ok, fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import { advisoryMemberUploadPresignSchema } from "@/lib/schemas";
import { createUploadUrl, saveLocalObject } from "@/lib/storage";
import { getStorageDriver } from "@/lib/storage-driver";
import { isAllowedImageMime } from "@/lib/multipart-upload";

function safeSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
}

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

    const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase() : "";
    const baseName = ext ? file.name.slice(0, file.name.length - ext.length) : file.name;
    const storageKey = `advisory-members/photo-${Date.now()}-${safeSlug(baseName)}${ext}`;
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileUrl = await saveLocalObject(storageKey, buffer, file.type || "image/jpeg");
      return ok({
        key: storageKey,
        fileUrl,
        expectedSize: file.size,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Photo upload failed";
      return fail(`Failed to save photo: ${message}`, 500);
    }
  }

  const parsed = advisoryMemberUploadPresignSchema.safeParse(await request.json());
  if (!parsed.success) return fail("Invalid payload", 400, parsed.error.flatten());

  try {
    const { filename, contentType, size } = parsed.data;
    const ext = filename.includes(".") ? filename.slice(filename.lastIndexOf(".")).toLowerCase() : "";
    const baseName = ext ? filename.slice(0, filename.length - ext.length) : filename;
    const key = `advisory-members/photo-${Date.now()}-${safeSlug(baseName)}${ext}`;
    const signed = await createUploadUrl(key, contentType);

    return ok({
      key,
      uploadUrl: signed.uploadUrl,
      fileUrl: signed.fileUrl,
      expectedSize: size,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Photo upload is not configured";
    return fail(`Failed to prepare photo upload: ${message}`, 500);
  }
}
