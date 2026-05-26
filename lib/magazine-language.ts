import type { MagazineLanguage } from "@prisma/client";

export type MagazineLocale = "ar" | "en";

export function parseMagazineLanguage(value: MagazineLanguage | string | null | undefined): MagazineLocale {
  if (value === "EN") return "en";
  return "ar";
}

export function magazineDir(locale: MagazineLocale): "rtl" | "ltr" {
  return locale === "en" ? "ltr" : "rtl";
}

export function magazineDateLocale(locale: MagazineLocale): string {
  return locale === "en" ? "en-US" : "ar-EG";
}
