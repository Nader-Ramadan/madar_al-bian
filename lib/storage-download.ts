import { readFile } from "node:fs/promises";
import path from "node:path";
import { isCloudinaryDeliveryUrl } from "@/lib/cloudinary";

export function contentDispositionAttachment(filename: string, asciiFallback = "document"): string {
  const ascii = filename.replace(/[^\x20-\x7E]/g, "_") || asciiFallback;
  const encoded = encodeURIComponent(filename);
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

export function assertAllowedStorageUrl(url: string): void {
  const trimmed = url.trim();
  if (!trimmed) throw new Error("Missing file URL");

  if (trimmed.startsWith("/uploads/")) {
    const normalized = path.normalize(trimmed).replace(/^(\.\.(\/|\\|$))+/, "");
    if (!normalized.startsWith("/uploads/")) {
      throw new Error("Invalid local file path");
    }
    return;
  }

  if (!isCloudinaryDeliveryUrl(trimmed)) {
    throw new Error("File URL is not from an allowed source");
  }

  const host = new URL(trimmed).hostname.toLowerCase();
  if (!host.endsWith("cloudinary.com")) {
    throw new Error("File URL is not from an allowed host");
  }
}

/** @deprecated Use assertAllowedStorageUrl */
export function assertAllowedPdfSourceUrl(url: string): void {
  assertAllowedStorageUrl(url);
}

async function readLocalUploadFile(uploadPath: string): Promise<Buffer> {
  const normalized = path.normalize(uploadPath).replace(/^(\.\.(\/|\\|$))+/, "");
  if (!normalized.startsWith("/uploads/")) {
    throw new Error("Invalid local file path");
  }
  const absolute = path.join(process.cwd(), "public", normalized.replace(/^\//, ""));
  return readFile(absolute);
}

export async function fetchStorageBuffer(sourceUrl: string): Promise<Buffer> {
  assertAllowedStorageUrl(sourceUrl);
  const trimmed = sourceUrl.trim();

  if (trimmed.startsWith("/uploads/")) {
    return readLocalUploadFile(trimmed);
  }

  const upstream = await fetch(trimmed, { redirect: "follow" });
  if (!upstream.ok) {
    throw new Error("Could not fetch file from storage");
  }
  return Buffer.from(await upstream.arrayBuffer());
}
