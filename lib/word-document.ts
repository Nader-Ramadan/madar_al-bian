const WORD_MIMES = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-word",
] as const;

export const MAX_WORD_DOCUMENT_BYTES = 15 * 1024 * 1024;

export function isLikelyWordDocument(file: File): boolean {
  const lower = file.name.toLowerCase();
  const extOk = lower.endsWith(".doc") || lower.endsWith(".docx");
  if (!extOk) return false;
  const t = file.type?.toLowerCase() ?? "";
  if (!t || t === "application/octet-stream") return true;
  if ((WORD_MIMES as readonly string[]).includes(t)) return true;
  if (t.includes("word") || t.includes("msword") || t.includes("wordprocessingml")) return true;
  return false;
}
