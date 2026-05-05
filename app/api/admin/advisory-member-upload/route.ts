import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import { ok, fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import { advisoryMemberUploadPresignSchema } from "@/lib/schemas";
import { createUploadUrl } from "@/lib/storage";

function safeSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
}

export async function POST(request: NextRequest) {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;

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
