import { NextRequest } from "next/server";
import { uploadFileToStorage, type UploadToStorageOptions } from "@/lib/storage";
import type { CloudinaryResourceType } from "@/lib/cloudinary";

export const IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp"] as const;

export function isAllowedImageMime(file: File): boolean {
  const t = file.type;
  if ((IMAGE_MIMES as readonly string[]).includes(t)) return true;
  const lower = file.name.toLowerCase();
  return /\.(jpe?g|png|webp)$/i.test(lower);
}

export function isLikelyPdf(file: File): boolean {
  const t = file.type;
  if (t && t.includes("pdf")) return true;
  return file.name.toLowerCase().endsWith(".pdf");
}

export { isLikelyWordDocument, MAX_WORD_DOCUMENT_BYTES } from "@/lib/word-document";

export function requireMultipartContentType(request: NextRequest): boolean {
  const hdr = request.headers.get("content-type") || "";
  return hdr.includes("multipart/form-data");
}

export async function parseMultipartFile(request: NextRequest): Promise<File | null> {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return null;
  return file;
}

export async function uploadMultipartFileToCloudinary(
  file: File,
  options: { folder: string; resourceType: CloudinaryResourceType },
): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadOpts: UploadToStorageOptions = {
    folder: options.folder,
    resourceType: options.resourceType,
    filename: file.name,
  };
  return uploadFileToStorage(buffer, uploadOpts);
}
