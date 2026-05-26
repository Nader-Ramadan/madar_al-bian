import { NextResponse } from "next/server";
import {
  contentDispositionAttachment,
  fetchStorageBuffer,
} from "@/lib/storage-download";
import { sanitizeWordFilename, wordMimeType } from "@/lib/word-filename";

export { sanitizeWordFilename, wordMimeType } from "@/lib/word-filename";

export async function proxyWordDownload(sourceUrl: string, filename: string): Promise<NextResponse> {
  const safeName = sanitizeWordFilename(filename, "study.docx");

  try {
    const body = await fetchStorageBuffer(sourceUrl);
    const bytes = new Uint8Array(body);
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": wordMimeType(safeName),
        "Content-Disposition": contentDispositionAttachment(safeName, "study.docx"),
        "Content-Length": String(bytes.length),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Download failed";
    if (message.includes("ENOENT")) {
      return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
    }
    if (message.includes("allowed") || message.includes("Invalid") || message.includes("Missing")) {
      return NextResponse.json({ success: false, error: "File source not allowed" }, { status: 400 });
    }
    if (message.includes("Could not fetch")) {
      return NextResponse.json({ success: false, error: "Could not fetch file" }, { status: 502 });
    }
    return NextResponse.json({ success: false, error: "Could not download file" }, { status: 500 });
  }
}
