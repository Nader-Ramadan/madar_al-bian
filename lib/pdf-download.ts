import { NextResponse } from "next/server";
import {
  assertAllowedStorageUrl,
  contentDispositionAttachment,
  fetchStorageBuffer,
} from "@/lib/storage-download";

export type PdfDownloadKind = "research" | "magazine" | "version";

const PDF_DOWNLOAD_KINDS: PdfDownloadKind[] = ["research", "magazine", "version"];

export function isPdfDownloadKind(value: string): value is PdfDownloadKind {
  return (PDF_DOWNLOAD_KINDS as string[]).includes(value);
}

export function pdfDownloadPath(kind: PdfDownloadKind, id: number): string {
  return `/api/downloads/pdf/${kind}/${id}`;
}

/** ASCII-safe download name that always ends with `.pdf`. */
export function sanitizePdfFilename(base: string, fallback: string): string {
  let safe = base
    .replace(/[^a-zA-Z0-9._\u0600-\u06FF-]/g, "_")
    .replace(/_+/g, "_")
    .trim();
  if (!safe) safe = fallback.replace(/[^a-zA-Z0-9._\u0600-\u06FF-]/g, "_").replace(/_+/g, "_").trim();
  if (!safe) safe = "document";
  safe = safe.replace(/\.pdf$/i, "");
  return `${safe}.pdf`;
}

export { assertAllowedStorageUrl as assertAllowedPdfSourceUrl };

export async function proxyPdfDownload(sourceUrl: string, filename: string): Promise<NextResponse> {
  const safeName = sanitizePdfFilename(filename, "document.pdf");

  try {
    const body = await fetchStorageBuffer(sourceUrl);
    const bytes = new Uint8Array(body);
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDispositionAttachment(safeName, "document.pdf"),
        "Content-Length": String(bytes.length),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Download failed";
    if (message.includes("ENOENT")) {
      return NextResponse.json({ success: false, error: "Could not fetch PDF" }, { status: 404 });
    }
    if (message.includes("allowed") || message.includes("Invalid") || message.includes("Missing")) {
      return NextResponse.json({ success: false, error: "PDF source not allowed" }, { status: 400 });
    }
    if (message.includes("Could not fetch")) {
      return NextResponse.json({ success: false, error: "Could not fetch PDF" }, { status: 502 });
    }
    return NextResponse.json({ success: false, error: "Could not download PDF" }, { status: 500 });
  }
}
