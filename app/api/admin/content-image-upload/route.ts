import { NextRequest } from "next/server";
import { z } from "zod";
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

const contentMultipartMeta = z.object({
  kind: z.enum(["blog", "conference"]),
});

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

  const metaParsed = contentMultipartMeta.safeParse({ kind: form.get("kind") });
  if (!metaParsed.success) return fail("Invalid payload", 400, metaParsed.error.flatten());

  const { kind } = metaParsed.data;

  try {
    const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase() : "";
    const baseName = ext ? file.name.slice(0, file.name.length - ext.length) : file.name;
    const folder = `content/${kind}/${Date.now()}-${safeSlug(baseName)}${ext}`;
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
    const message = error instanceof Error ? error.message : "Upload failed";
    return fail(message, 500);
  }
}
