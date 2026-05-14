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

function prismaErrorCode(err: unknown): string | null {
  if (typeof err !== "object" || err === null) return null;
  if (
    "code" in err &&
    typeof (err as { code: unknown }).code === "string"
  ) {
    return (err as { code: string }).code;
  }
  return null;
}

function magazinesLoadErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  const code = prismaErrorCode(err);

  if (msg.includes("Database URL is not configured")) {
    return `تعذر تحميل المجلات: Database URL is not configured. Set DATABASE_URL (or DB_HOST, DB_USER, DB_PASSWORD, DB_NAME) in the hosting environment. تحقق من إعدادات Hostinger (hPanel) ثم أعد تشغيل التطبيق.`;
  }

  if (
    code === "P1000" ||
    msg.includes("P1000") ||
    /authentication failed against database server/i.test(msg) ||
    /access denied for user/i.test(msg)
  ) {
    return `تعذر تحميل المجلات: Database authentication failed (wrong user/password, or user not allowed from this host). Check DB_USER and DB_PASSWORD; if you use DATABASE_URL, percent-encode special characters in the password. راجع بيانات الدخول في hPanel وملف .env.`;
  }

  if (
    msg.includes("Can't reach database server") ||
    msg.includes("P1001") ||
    code === "P1001" ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("ETIMEDOUT")
  ) {
    return `تعذر تحميل المجلات: Cannot reach the database server. Check DATABASE_URL, firewall, and Remote MySQL access. تحقق من الاتصال بقاعدة البيانات على Hostinger.`;
  }

  if (
    code === "P2021" ||
    /does not exist/i.test(msg) ||
    /Unknown table/i.test(msg) ||
    /Table .* doesn't exist/i.test(msg)
  ) {
    return `تعذر تحميل المجلات: الجداول غير موجودة في قاعدة البيانات. على الخادم شغّل ترحيل Prisma: npx prisma migrate deploy ثم أعد تشغيل التطبيق. (The database schema is missing — run migrations on the server.)`;
  }

  if (code === "P1003" || /database .* does not exist/i.test(msg)) {
    return `تعذر تحميل المجلات: اسم قاعدة البيانات غير صحيح أو غير موجود (P1003). راجع DB_NAME في hPanel أو DATABASE_URL.`;
  }

  const codeHint = code != null ? ` رمز الخطأ: ${code}.` : "";
  return `تعذر تحميل المجلات (خطأ من الخادم).${codeHint} تحقق من اتصال قاعدة البيانات وإعدادات DATABASE_URL أو DB_HOST و DB_USER و DB_PASSWORD و DB_NAME ثم أعد تشغيل الخادم. إذا كان لديك DATABASE_URL و DB_* معاً، DATABASE_URL هو المستخدم — احذف القيمة الخاطئة أو صححها.`;
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
