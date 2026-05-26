import { NextRequest } from "next/server";
import { fail } from "@/lib/api-response";
import {
  isPdfDownloadKind,
  proxyPdfDownload,
  sanitizePdfFilename,
  type PdfDownloadKind,
} from "@/lib/pdf-download";
import { prisma } from "@/lib/prisma";

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? id : null;
}

async function resolvePdfSource(
  kind: PdfDownloadKind,
  id: number,
): Promise<{ sourceUrl: string; filename: string } | null> {
  if (kind === "research") {
    const row = await prisma.magazineVersionResearch.findUnique({
      where: { id },
      select: { pdfUrl: true },
    });
    const sourceUrl = row?.pdfUrl?.trim();
    if (!sourceUrl) return null;
    return { sourceUrl, filename: sanitizePdfFilename(`research-${id}`, "research.pdf") };
  }

  if (kind === "magazine") {
    const row = await prisma.magazine.findUnique({
      where: { id },
      select: { pdfUrl: true },
    });
    const sourceUrl = row?.pdfUrl?.trim();
    if (!sourceUrl) return null;
    return { sourceUrl, filename: sanitizePdfFilename(`magazine-${id}`, "magazine.pdf") };
  }

  const row = await prisma.magazineVersion.findUnique({
    where: { id },
    select: { pdfUrl: true },
  });
  const sourceUrl = row?.pdfUrl?.trim();
  if (!sourceUrl) return null;
  return { sourceUrl, filename: sanitizePdfFilename(`version-${id}`, "version.pdf") };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ kind: string; id: string }> },
) {
  const { kind: rawKind, id: rawId } = await params;
  if (!isPdfDownloadKind(rawKind)) return fail("Invalid download type", 400);

  const id = parseId(rawId);
  if (!id) return fail("Invalid id", 400);

  const resolved = await resolvePdfSource(rawKind, id);
  if (!resolved) return fail("PDF not found", 404);

  try {
    return await proxyPdfDownload(resolved.sourceUrl, resolved.filename);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Download failed";
    if (message.includes("ENOENT")) return fail("PDF file not found", 404);
    if (message.includes("allowed") || message.includes("Invalid")) {
      return fail("PDF source not allowed", 400);
    }
    return fail("Could not download PDF", 500);
  }
}
