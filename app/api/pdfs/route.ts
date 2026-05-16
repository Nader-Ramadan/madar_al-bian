import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import { UserRole } from "@prisma/client";
import {
  isLikelyPdf,
  requireMultipartContentType,
  uploadMultipartFileToCloudinary,
} from "@/lib/multipart-upload";

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

  if (!requireMultipartContentType(request)) {
    return fail("Expected multipart/form-data with field file", 400);
  }

  const form = await request.formData();
  const rawFile = form.get("file");
  const file = rawFile instanceof File && rawFile.size > 0 ? rawFile : null;
  if (!file) return fail("Missing file", 400);
  if (file.size > 20 * 1024 * 1024) return fail("File too large", 400);
  if (!isLikelyPdf(file)) return fail("Only PDF files are allowed", 400);

  try {
    const safeName = file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "") || "document.pdf";
    const folder = `pdfs/${Date.now()}-${safeName}`;
    const fileUrl = await uploadMultipartFileToCloudinary(file, {
      folder,
      resourceType: "raw",
    });
    return ok({
      key: folder,
      fileUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PDF upload failed";
    return fail(message, 500);
  }
}
