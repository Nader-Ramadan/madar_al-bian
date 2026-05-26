import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import { proxyWordDownload, sanitizeWordFilename } from "@/lib/word-download";

function parseId(value: string) {
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
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

  const filename = sanitizeWordFilename(row.documentFilename?.trim() || "", "study.docx");
  return proxyWordDownload(row.documentUrl, filename);
}
