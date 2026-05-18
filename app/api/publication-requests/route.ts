import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import {
  isLikelyWordDocument,
  MAX_WORD_DOCUMENT_BYTES,
  requireMultipartContentType,
  uploadMultipartFileToCloudinary,
} from "@/lib/multipart-upload";
import { ABSTRACT_MIN_WORDS_MESSAGE, meetsMinAbstractWords } from "@/lib/publication-request-abstract";

const publicationRequestFormSchema = z.object({
  authorName: z.string().min(2).max(255),
  authorEmail: z.string().email(),
  title: z.string().min(2).max(255),
  abstract: z.string().refine(meetsMinAbstractWords, { message: ABSTRACT_MIN_WORDS_MESSAGE }),
  magazineId: z.number().int().positive().optional().nullable(),
});

function parseMagazineId(raw: FormDataEntryValue | null): number | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (s === "") return null;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function safeDocumentName(name: string): string {
  const cleaned = name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
  if (cleaned.length > 0) return cleaned;
  return name.toLowerCase().endsWith(".doc") ? "document.doc" : "document.docx";
}

export async function POST(request: NextRequest) {
  if (!requireMultipartContentType(request)) {
    return fail("يُتوقع إرسال النموذج بصيغة multipart/form-data", 400);
  }

  const form = await request.formData();
  const rawFile = form.get("file");
  const file = rawFile instanceof File && rawFile.size > 0 ? rawFile : null;
  if (!file) return fail("ملف الدراسة مطلوب", 400);
  if (!isLikelyWordDocument(file)) {
    return fail("يُسمح فقط بملفات Word (.doc أو .docx)", 400);
  }
  if (file.size > MAX_WORD_DOCUMENT_BYTES) {
    return fail("حجم الملف كبير جداً (الحد الأقصى 15 ميجابايت)", 400);
  }

  const parsed = publicationRequestFormSchema.safeParse({
    authorName: String(form.get("authorName") ?? ""),
    authorEmail: String(form.get("authorEmail") ?? ""),
    title: String(form.get("title") ?? ""),
    abstract: String(form.get("abstract") ?? ""),
    magazineId: parseMagazineId(form.get("magazineId")),
  });
  if (!parsed.success) {
    return fail("بيانات النموذج غير صالحة", 400, parsed.error.flatten());
  }

  const data = parsed.data;
  if (data.magazineId != null) {
    const mag = await prisma.magazine.findUnique({
      where: { id: data.magazineId },
      select: { id: true },
    });
    if (!mag) return fail("المجلة غير موجودة", 400);
  }

  let documentUrl: string;
  try {
    const safeName = safeDocumentName(file.name);
    const folder = `publication-requests/${Date.now()}-${safeName}`;
    documentUrl = await uploadMultipartFileToCloudinary(file, {
      folder,
      resourceType: "raw",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر رفع الملف";
    return fail(message, 500);
  }

  const created = await prisma.publicationRequest.create({
    data: {
      authorName: data.authorName,
      authorEmail: data.authorEmail,
      title: data.title,
      abstract: data.abstract,
      magazineId: data.magazineId,
      documentUrl,
      documentFilename: file.name,
      documentSize: file.size,
    },
  });

  return ok(created, { status: 201 });
}
