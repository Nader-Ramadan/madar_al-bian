import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import { UserRole } from "@prisma/client";
import { createUploadUrl } from "@/lib/storage";

const createSchema = z.object({
  filename: z.string().min(1).max(255),
  filepath: z.string().url(),
  size: z.number().int().positive(),
  mimeType: z.string().max(100).optional(),
});

const uploadRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(100),
  size: z.number().int().positive().max(20 * 1024 * 1024),
});

export async function GET() {
  const items = await prisma.pdf.findMany({ orderBy: { uploaded_at: "desc" } });
  return ok(items);
}

export async function POST(request: NextRequest) {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;
  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return fail("Invalid payload", 400, parsed.error.flatten());

  const created = await prisma.pdf.create({
    data: {
      ...parsed.data,
      uploadedById: auth.user?.id,
    },
  });
  return ok(created, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;
  const parsed = uploadRequestSchema.safeParse(await request.json());
  if (!parsed.success) return fail("Invalid payload", 400, parsed.error.flatten());

  if (!parsed.data.contentType.includes("pdf")) {
    return fail("Only PDF files are allowed", 400);
  }

  const key = `pdfs/${Date.now()}-${parsed.data.filename.replace(/\s+/g, "-")}`;
  const presigned = await createUploadUrl(key, parsed.data.contentType);
  return ok({
    key,
    uploadUrl: presigned.uploadUrl,
    fileUrl: presigned.fileUrl,
  });
}
