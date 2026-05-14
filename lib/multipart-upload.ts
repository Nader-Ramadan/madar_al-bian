/** Shared MIME checks for multipart admin uploads (local storage). */

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
