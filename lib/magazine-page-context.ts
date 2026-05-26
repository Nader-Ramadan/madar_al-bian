import { cache } from "react";
import type { MagazineLanguage } from "@prisma/client";
import { getMagazineUiCopy, type MagazineUiCopy } from "@/lib/magazine-ui-copy";
import {
  magazineDateLocale,
  magazineDir,
  parseMagazineLanguage,
  type MagazineLocale,
} from "@/lib/magazine-language";
import { prisma } from "@/lib/prisma";

export type MagazinePageContext = {
  magazineId: number;
  language: MagazineLanguage;
  locale: MagazineLocale;
  dir: "rtl" | "ltr";
  dateLocale: string;
  copy: MagazineUiCopy;
};

export const getMagazinePageContext = cache(async (magazineId: number): Promise<MagazinePageContext | null> => {
  const row = await prisma.magazine.findUnique({
    where: { id: magazineId },
    select: { id: true, language: true },
  });
  if (!row) return null;

  const locale = parseMagazineLanguage(row.language);
  return {
    magazineId: row.id,
    language: row.language,
    locale,
    dir: magazineDir(locale),
    dateLocale: magazineDateLocale(locale),
    copy: getMagazineUiCopy(locale),
  };
});
