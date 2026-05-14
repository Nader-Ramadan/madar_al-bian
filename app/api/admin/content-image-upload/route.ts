import { NextRequest } from "next/server";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { ok, fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import { contentImageUploadPresignSchema } from "@/lib/schemas";
import { createUploadUrl, saveLocalObject } from "@/lib/storage";
import { getStorageDriver } from "@/lib/storage-driver";
import { isAllowedImageMime } from "@/lib/multipart-upload";

function safeSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
}

const contentMultipartMeta = z.object({
  kind: z.enum(["blog", "conference"]),
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

    const metaParsed = contentMultipartMeta.safeParse({ kind: form.get("kind") });
    if (!metaParsed.success) return fail("Invalid payload", 400, metaParsed.error.flatten());

    const { kind } = metaParsed.data;
    try {
      const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase() : "";
      const baseName = ext ? file.name.slice(0, file.name.length - ext.length) : file.name;
      const storageKey = `content/${kind}/${Date.now()}-${safeSlug(baseName)}${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileUrl = await saveLocalObject(storageKey, buffer, file.type || "image/jpeg");
      return ok({
        key: storageKey,
        fileUrl,
        expectedSize: file.size,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      return fail(`Failed to save image: ${message}`, 500);
    }
  }

  const parsed = contentImageUploadPresignSchema.safeParse(await request.json());
  if (!parsed.success) return fail("Invalid payload", 400, parsed.error.flatten());

  try {
    const { kind, filename, contentType, size } = parsed.data;
    const ext = filename.includes(".") ? filename.slice(filename.lastIndexOf(".")).toLowerCase() : "";
    const baseName = ext ? filename.slice(0, filename.length - ext.length) : filename;
    const key = `content/${kind}/${Date.now()}-${safeSlug(baseName)}${ext}`;
    const signed = await createUploadUrl(key, contentType);

    return ok({
      key,
      uploadUrl: signed.uploadUrl,
      fileUrl: signed.fileUrl,
      expectedSize: size,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload is not configured";
    return fail(`Failed to prepare image upload: ${message}`, 500);
  }
}
