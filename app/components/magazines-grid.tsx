import styles from "../magazines-grid.module.css";
import Image from "next/image";
import Link from "next/link";
import type { MagazineCard } from "@/lib/load-magazines-page";

export type { MagazineCard };

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

type MagazinesGridProps = {
  /** Loaded on the server; avoids client fetch to /api/magazines (Hostinger / proxy issues). */
  initialItems: MagazineCard[];
  initialError: string | null;
};

export default function MagazinesGrid({ initialItems, initialError }: MagazinesGridProps) {
  if (initialError) {
    return (
      <section className={styles.section}>
        <p className={styles.errorState}>{initialError}</p>
        <p className={styles.errorHint}>
          إذا كان الجدول فارغاً، طبّق الهجرة ثم شغّل البذور:{" "}
          <code className={styles.inlineCode}>npm run db:seed</code> (أو{" "}
          <code className={styles.inlineCode}>npx prisma db seed</code>
          ) بعد ضبط قاعدة البيانات. للتحقق من واجهة الـ API (اختياري) افتح{" "}
          <code className={styles.inlineCode}>/api/magazines?limit=5</code> في المتصفح.
        </p>
      </section>
    );
  }

  if (initialItems.length === 0) {
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
        {initialItems.map((magazine) => {
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
