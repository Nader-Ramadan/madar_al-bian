/** Safe download name preserving `.doc` or `.docx` (no Node/server imports). */
export function sanitizeWordFilename(base: string, fallback: string): string {
  let safe = base
    .replace(/[^a-zA-Z0-9._\u0600-\u06FF-]/g, "_")
    .replace(/_+/g, "_")
    .trim();
  if (!safe) {
    safe = fallback
      .replace(/[^a-zA-Z0-9._\u0600-\u06FF-]/g, "_")
      .replace(/_+/g, "_")
      .trim();
  }
  if (!safe) safe = "study.docx";
  const lower = safe.toLowerCase();
  if (lower.endsWith(".docx") || lower.endsWith(".doc")) return safe;
  return `${safe.replace(/\.(docx?|doc)$/i, "")}.docx`;
}

export function wordMimeType(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (lower.endsWith(".doc")) {
    return "application/msword";
  }
  return "application/octet-stream";
}
