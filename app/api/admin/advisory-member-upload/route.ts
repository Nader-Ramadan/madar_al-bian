import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import { ok, fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import {
  isAllowedImageMime,
  requireMultipartContentType,
  uploadMultipartFileToCloudinary,
} from "@/lib/multipart-upload";

function safeSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
}

export async function POST(request: NextRequest) {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;

  if (!requireMultipartContentType(request)) {
    return fail("Expected multipart/form-data with field file", 400);
  }

  const form = await request.formData();
  const rawFile = form.get("file");
  const file = rawFile instanceof File && rawFile.size > 0 ? rawFile : null;
  if (!file) return fail("Missing file", 400);
  if (!isAllowedImageMime(file)) return fail("Only JPEG, PNG, or WebP images are allowed", 400);
  if (file.size > 8 * 1024 * 1024) return fail("File too large", 400);

  try {
    const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase() : "";
    const baseName = ext ? file.name.slice(0, file.name.length - ext.length) : file.name;
    const folder = `advisory-members/photo-${Date.now()}-${safeSlug(baseName)}${ext}`;
    const fileUrl = await uploadMultipartFileToCloudinary(file, {
      folder,
      resourceType: "image",
    });
    return ok({
      key: folder,
      fileUrl,
      expectedSize: file.size,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Photo upload failed";
    return fail(message, 500);
  }
}
