import { NextRequest } from "next/server";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import {
  isAllowedImageMime,
  requireMultipartContentType,
  uploadMultipartFileToCloudinary,
} from "@/lib/multipart-upload";

const advisorMultipartMeta = z.object({
  magazineId: z.coerce.number().int().positive(),
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
  if (file.size > 5 * 1024 * 1024) return fail("File too large", 400);

  const metaParsed = advisorMultipartMeta.safeParse({ magazineId: form.get("magazineId") });
  if (!metaParsed.success) return fail("Invalid payload", 400, metaParsed.error.flatten());

  const { magazineId } = metaParsed.data;
  const magazine = await prisma.magazine.findUnique({
    where: { id: magazineId },
    select: { id: true },
  });
  if (!magazine) return fail("Magazine not found", 404);

  try {
    const safe = file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "") || "photo";
    const folder = `magazine-advisors/${magazineId}/${Date.now()}-${safe}`;
    const fileUrl = await uploadMultipartFileToCloudinary(file, {
      folder,
      resourceType: "image",
    });
    return ok({ fileUrl, expectedSize: file.size });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Photo upload failed";
    return fail(message, 500);
  }
}
