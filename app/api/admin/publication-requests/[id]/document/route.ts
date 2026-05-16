import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";

function parseId(value: string) {
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
}

/** Cloudinary raw URL with attachment flag for browser download. */
function attachmentUrl(secureUrl: string, filename: string): string {
  const safe = filename.replace(/[^a-zA-Z0-9._\u0600-\u06FF-]/g, "_") || "study.docx";
  if (secureUrl.includes("/upload/")) {
    return secureUrl.replace("/upload/", `/upload/fl_attachment:${safe}/`);
  }
  return secureUrl;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return fail("معرّف غير صالح", 400);

  const row = await prisma.publicationRequest.findUnique({
    where: { id },
    select: { documentUrl: true, documentFilename: true },
  });
  if (!row?.documentUrl) return fail("لا يوجد ملف مرفق", 404);

  const filename = row.documentFilename?.trim() || "study.docx";
  const target = attachmentUrl(row.documentUrl, filename);
  return NextResponse.redirect(target, 302);
}
