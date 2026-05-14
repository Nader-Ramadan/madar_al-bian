import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import { UserRole } from "@prisma/client";
import { createUploadUrl, saveLocalObject } from "@/lib/storage";
import { getStorageDriver } from "@/lib/storage-driver";
import { isLikelyPdf } from "@/lib/multipart-upload";

const filepathSchema = z.union([
  z.string().url(),
  z.string().min(12).max(500).startsWith("/uploads/"),
]);

const createSchema = z.object({
  filename: z.string().min(1).max(255),
  filepath: filepathSchema,
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

  if (getStorageDriver() === "local") {
    const hdr = request.headers.get("content-type") || "";
    if (!hdr.includes("multipart/form-data")) {
      return fail("Expected multipart/form-data with field file", 400);
    }
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) return fail("Missing file", 400);
    if (file.size > 20 * 1024 * 1024) return fail("File too large", 400);
    if (!isLikelyPdf(file)) return fail("Only PDF files are allowed", 400);

    const safeName = file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "") || "document.pdf";
    const storageKey = `pdfs/${Date.now()}-${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileUrl = await saveLocalObject(storageKey, buffer, file.type || "application/pdf");
    return ok({
      key: storageKey,
      fileUrl,
    });
  }

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
