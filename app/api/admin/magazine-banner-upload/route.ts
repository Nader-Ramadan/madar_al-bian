import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import { magazineBannerUploadPresignSchema } from "@/lib/schemas";
import { createUploadUrl } from "@/lib/storage";

function safeSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
}

export async function POST(request: NextRequest) {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;

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
