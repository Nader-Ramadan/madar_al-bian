import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import {
  getUploadFileFromFormData,
  isLikelyWordDocument,
  MAX_WORD_DOCUMENT_BYTES,
  requireMultipartContentType,
  uploadMultipartFileToCloudinary,
} from "@/lib/multipart-upload";
import { publicationRequestFormSchema } from "@/lib/schemas";

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
  const file = getUploadFileFromFormData(form, "file");
  // #region agent log
  fetch("http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "51cdae" },
    body: JSON.stringify({
      sessionId: "51cdae",
      runId: "pre-fix",
      hypothesisId: "H2",
      location: "app/api/publication-requests/route.ts:POST",
      message: "multipart file parse",
      data: {
        hasFile: !!file,
        rawType: rawFile == null ? "null" : typeof rawFile,
        rawCtor: rawFile && typeof rawFile === "object" ? (rawFile as object).constructor?.name : null,
        rawSize: rawFile && typeof rawFile === "object" && "size" in rawFile ? (rawFile as Blob).size : null,
        isFileInstance: rawFile instanceof File,
        isBlobInstance: rawFile instanceof Blob,
        fileName: file?.name ?? null,
        fileSize: file?.size ?? null,
        formKeys: [...form.keys()],
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  if (!file) {
    const emptyBlob =
      rawFile != null &&
      typeof rawFile === "object" &&
      "size" in rawFile &&
      (rawFile as Blob).size === 0;
    return fail(
      emptyBlob
        ? "ملف الدراسة فارغ أو غير مكتمل التحميل. احفظ الملف محلياً ثم أعد الإرفاق."
        : "ملف الدراسة مطلوب",
      400,
    );
  }
  if (!isLikelyWordDocument(file)) {
    return fail("يُسمح فقط بملفات Word (.doc أو .docx)", 400);
  }
  if (file.size > MAX_WORD_DOCUMENT_BYTES) {
    return fail("حجم الملف كبير جداً (الحد الأقصى 15 ميجابايت)", 400);
  }

  const parsed = publicationRequestFormSchema.safeParse({
    authorName: String(form.get("authorName") ?? ""),
    authorEmail: String(form.get("authorEmail") ?? ""),
    authorPhoneCountry: String(form.get("authorPhoneCountry") ?? ""),
    authorPhoneNational: String(form.get("authorPhoneNational") ?? ""),
    title: String(form.get("title") ?? ""),
    abstract: String(form.get("abstract") ?? ""),
    magazineId: parseMagazineId(form.get("magazineId")),
  });
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const firstField = Object.values(flat.fieldErrors)[0]?.[0];
    const firstForm = flat.formErrors[0];
    return fail(firstField ?? firstForm ?? "بيانات النموذج غير صالحة", 400, flat);
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

  // #region agent log
  fetch("http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "51cdae" },
    body: JSON.stringify({
      sessionId: "51cdae",
      runId: "pre-fix",
      hypothesisId: "H4",
      location: "app/api/publication-requests/route.ts:POST",
      message: "creating publication request",
      data: { magazineId: data.magazineId, documentUrlLen: documentUrl.length },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  let created;
  try {
    created = await prisma.publicationRequest.create({
      data: {
        authorName: data.authorName,
        authorEmail: data.authorEmail,
        authorPhone: data.authorPhone,
        title: data.title,
        abstract: data.abstract,
        magazineId: data.magazineId,
        documentUrl,
        documentFilename: file.name,
        documentSize: file.size,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    // #region agent log
    fetch("http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "51cdae" },
      body: JSON.stringify({
        sessionId: "51cdae",
        runId: "pre-fix",
        hypothesisId: "H4",
        location: "app/api/publication-requests/route.ts:POST",
        message: "prisma create failed",
        data: { errorSnippet: msg.slice(0, 200) },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    if (msg.includes("Unknown argument `authorPhone`")) {
      return fail(
        "عميل Prisma غير متزامن مع المخطط. أوقف npm run dev بالكامل، ثم شغّل: npx prisma generate (يجب أن ينجح بدون EPERM)، ثم npm run dev. على Hostinger: npx prisma generate && npx prisma migrate deploy ثم Restart.",
        500,
      );
    }
    console.error("[publication-requests] create failed:", error);
    return fail("تعذر حفظ الطلب في قاعدة البيانات. حاول لاحقاً أو تواصل مع الدعم.", 500);
  }

  // #region agent log
  fetch("http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "51cdae" },
    body: JSON.stringify({
      sessionId: "51cdae",
      runId: "post-fix",
      hypothesisId: "H4",
      location: "app/api/publication-requests/route.ts:POST",
      message: "publication request created",
      data: { id: created.id, hasAuthorPhone: created.authorPhone != null },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return ok(created, { status: 201 });
}
