import type { Magazine } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Shape expected by the magazines grid UI */
export type MagazineCard = {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  issn?: string | null;
  impactFactor?: string | number | null;
  currentVersion?: string | null;
};

function toCard(m: Magazine): MagazineCard {
  return {
    id: m.id,
    title: m.title,
    description: m.description,
    image: m.image,
    category: m.category,
    issn: m.issn,
    impactFactor: m.impactFactor != null ? Number(m.impactFactor) : null,
    currentVersion: m.currentVersion,
  };
}

function magazinesLoadErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);

  if (msg.includes("Database URL is not configured")) {
    return `تعذر تحميل المجلات: Database URL is not configured. Set DATABASE_URL (or DB_HOST, DB_USER, DB_PASSWORD, DB_NAME) in the hosting environment. تحقق من إعدادات Hostinger (hPanel) ثم أعد تشغيل التطبيق.`;
  }

  if (
    msg.includes("Can't reach database server") ||
    msg.includes("P1001") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("ETIMEDOUT")
  ) {
    return `تعذر تحميل المجلات: Cannot reach the database server. Check DATABASE_URL, firewall, and Remote MySQL access. تحقق من الاتصال بقاعدة البيانات على Hostinger.`;
  }

  return `تعذر تحميل المجلات (خطأ من الخادم). تحقق من اتصال قاعدة البيانات وإعدادات DATABASE_URL أو DB_HOST و DB_USER و DB_PASSWORD و DB_NAME ثم أعد تشغيل الخادم.`;
}

export async function loadMagazineCardsForPage(
  limit = 100,
): Promise<{ items: MagazineCard[]; error: string | null }> {
  try {
    const rows = await prisma.magazine.findMany({
      take: limit,
      orderBy: { id: "desc" },
    });
    return { items: rows.map(toCard), error: null };
  } catch (err) {
    console.error("[magazines page] prisma", err);
    return { items: [], error: magazinesLoadErrorMessage(err) };
  }
}
