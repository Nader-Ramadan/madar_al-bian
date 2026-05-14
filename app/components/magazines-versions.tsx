import Link from "next/link";
import styles from "../magazine-journal.module.css";

export type MagazineVersionItem = {
  id: number;
  version: string;
  title: string;
  releaseDateLabel: string;
  notes: string | null;
};

type MagazineVersionsProps = {
  magazineId: number;
  versions: MagazineVersionItem[];
  pdfUrl: string | null;
};

export default function MagazineVersions({ magazineId, versions, pdfUrl }: MagazineVersionsProps) {
  return (
    <section className={styles.versionsWrap}>
      <div className={`${styles.inner} ${styles.versionsSection}`}>
        <div className={styles.versionsHeadRow}>
          <h2 className={styles.versionsTitle}>إصدارات المجلة</h2>
          <div className={styles.versionsHeadActions}>
            <Link
              href={`/magazines/${magazineId}/publishing-conditions`}
              className={styles.versionsArchiveLink}
            >
              <span className={styles.versionsArchiveIcon} aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M8 13h8M8 17h6" />
                </svg>
              </span>
              <span>شروط النشر</span>
              <span className={styles.versionsArchiveChevron} aria-hidden>
                ‹
              </span>
            </Link>
            <Link href={`/magazines/${magazineId}/versions`} className={styles.versionsArchiveLink}>
              <span className={styles.versionsArchiveIcon} aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 6h13M8 12h13M8 18h9" />
                  <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
                  <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
                  <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
                </svg>
              </span>
              <span>عرض سجل الإصدارات كاملاً</span>
              <span className={styles.versionsArchiveChevron} aria-hidden>
                ‹
              </span>
            </Link>
          </div>
        </div>

        {pdfUrl ? (
          <p className={styles.versionPdfNote}>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
              تحميل المجلة (PDF)
            </a>
          </p>
        ) : versions.length > 0 ? (
          <p className={styles.versionNoPdf}>لا يتوفر ملف PDF لهذه المجلة حاليًا.</p>
        ) : null}

        {versions.length === 0 ? (
          <div className={styles.emptyVersions}>لا توجد إصدارات مسجّلة لهذه المجلة بعد.</div>
        ) : (
          <div className={styles.versionsGrid}>
            {versions.map((v) => (
              <article key={v.id} className={styles.versionCard}>
                <div className={styles.versionCardHeader}>
                  <span>{v.title}</span>
                  <span className={styles.versionBadge}>إصدار {v.version}</span>
                </div>
                <div className={styles.versionCardBody}>
                  <div className={styles.versionMeta}>تاريخ الإصدار: {v.releaseDateLabel}</div>
                  {v.notes?.trim() ? <p className={styles.versionNotes}>{v.notes.trim()}</p> : null}
                  <Link
                    href={`/magazines/${magazineId}/versions/${v.id}`}
                    className={styles.versionResearchButton}
                  >
                    بحوث هذا الإصدار
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
