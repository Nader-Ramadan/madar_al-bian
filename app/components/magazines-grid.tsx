"use client";
import styles from "../magazines-grid.module.css";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface MagazineCard {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  issn?: string | null;
  impactFactor?: string | number | null;
  currentVersion?: string | null;
}

function formatMetaLine(m: MagazineCard): string | null {
  const parts: string[] = [];
  if (m.issn) parts.push(`ISSN ${m.issn}`);
  if (m.currentVersion) parts.push(`الإصدار الحالي: ${m.currentVersion}`);
  if (m.impactFactor != null && m.impactFactor !== "") {
    const n =
      typeof m.impactFactor === "number"
        ? m.impactFactor
        : Number.parseFloat(String(m.impactFactor));
    if (Number.isFinite(n)) parts.push(`معامل التأثير: ${n.toFixed(3)}`);
  }
  return parts.length ? parts.join(" · ") : null;
}

export default function MagazinesGrid() {
  const [magazines, setMagazines] = useState<MagazineCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMagazines = async () => {
      setFetchError(null);
      try {
        const response = await fetch("/api/magazines?limit=100");
        const raw = await response.text();
        const contentType = response.headers.get("content-type") ?? "";
        const trimmed = raw.trimStart();
        const looksLikeHtml =
          trimmed.startsWith("<") ||
          (!contentType.includes("application/json") &&
            !trimmed.startsWith("{") &&
            !trimmed.startsWith("["));

        let payload: unknown;
        try {
          payload = raw.length === 0 ? null : JSON.parse(raw);
        } catch {
          setMagazines([]);
          setFetchError(
            looksLikeHtml
              ? "استلم المتصفح صفحة HTML بدلاً من JSON. على Hostinger يجب تشغيل تطبيق Node (مثلاً ملف server.js أو next start) مع متغير PORT، وأن يمرّر المضيف مسار /api إلى Next وليس إلى استضافة ثابتة فقط. افتح /api/magazines?limit=5 للتحقق: يجب أن يظهر نص JSON."
              : "تعذّر قراءة رد الخادم. افتح /api/magazines?limit=5 في المتصفح وتحقق من الاستجابة.",
          );
          return;
        }

        if (typeof payload !== "object" || payload === null) {
          setMagazines([]);
          setFetchError(
            "رد الخادم غير متوقع. افتح /api/magazines?limit=5 للتحقق من أن واجهة الـ API تعمل.",
          );
          return;
        }

        const body = payload as {
          success?: boolean;
          error?: string;
          data?: { items?: MagazineCard[] };
        };

        if (!response.ok || body.success === false) {
          const serverMsg = typeof body.error === "string" ? body.error : null;
          setMagazines([]);
          setFetchError(
            serverMsg
              ? `تعذر تحميل المجلات: ${serverMsg}. تحقق من اتصال قاعدة البيانات وملف البيئة (.env) ثم أعد المحاولة.`
              : "تعذر تحميل المجلات (خطأ من الخادم). تحقق من اتصال قاعدة البيانات وإعدادات DATABASE_URL أو DB_HOST و DB_USER و DB_PASSWORD و DB_NAME ثم أعد تشغيل الخادم.",
          );
          return;
        }

        setMagazines(Array.isArray(body.data?.items) ? body.data.items : []);
      } catch {
        setMagazines([]);
        setFetchError(
          "تعذر الاتصال بالخادم لتحميل المجلات (فشل الشبكة أو انقطع الاتصال). تأكد أن التطبيق يعمل على Hostinger وأن متغير PORT مضبوط ثم حدّث الصفحة.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchMagazines();
  }, []);

  if (loading && magazines.length === 0 && !fetchError) {
    return (
      <section className={styles.section}>
        <p className={styles.emptyState}>جاري التحميل…</p>
      </section>
    );
  }

  if (!loading && fetchError) {
    return (
      <section className={styles.section}>
        <p className={styles.errorState}>{fetchError}</p>
        <p className={styles.errorHint}>
          إذا كان الجدول فارغاً، طبّق الهجرة ثم شغّل البذور:{" "}
          <code className={styles.inlineCode}>npm run db:seed</code> (أو{" "}
          <code className={styles.inlineCode}>npx prisma db seed</code>
          ) بعد ضبط قاعدة البيانات. للتحقق افتح{" "}
          <code className={styles.inlineCode}>/api/magazines?limit=5</code> في المتصفح.
        </p>
      </section>
    );
  }

  if (!loading && magazines.length === 0) {
    return (
      <section className={styles.section}>
        <p className={styles.emptyState}>لا توجد مجلات لعرضها حالياً.</p>
        <p className={styles.errorHint}>
          لإضافة مجلات تجريبية (3+) بعد ضبط ملف البيئة (.env) وتطبيق الهجرة، نفّذ:{" "}
          <code className={styles.inlineCode}>npm run db:seed</code>
        </p>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {magazines.map((magazine) => {
          const meta = formatMetaLine(magazine);
          return (
            <Link
              key={magazine.id}
              href={`/magazines/${magazine.id}`}
              className={styles.card}
            >
              <div className={styles.imageWrapper}>
                <Image
                  src={magazine.image}
                  alt={magazine.title}
                  width={400}
                  height={300}
                  className={styles.image}
                />
              </div>
              <div className={styles.content}>
                <span className={styles.category}>{magazine.category}</span>
                <h3 className={styles.title}>{magazine.title}</h3>
                {meta ? <p className={styles.metaLine}>{meta}</p> : null}
                <p className={styles.description}>{magazine.description}</p>
                <span className={styles.visitBtn}>
                  <span>زيارة المجلة</span>
                  <span>→</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
