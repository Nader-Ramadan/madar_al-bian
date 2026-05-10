/** Split stored comma/Arabic-comma separated keywords into display tokens */
export function splitResearchKeywords(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[,،;؛]/)
    .map((s) => s.trim())
    .filter(Boolean);
}
