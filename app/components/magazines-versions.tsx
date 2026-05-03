import styles from "../magazine-journal.module.css";

export type MagazineVersionItem = {
  id: number;
  version: string;
  title: string;
  releaseDateLabel: string;
  notes: string | null;
};

type MagazineVersionsProps = {
  versions: MagazineVersionItem[];
  pdfUrl: string | null;
};

export default function MagazineVersions({ versions, pdfUrl }: MagazineVersionsProps) {
  return (
    <section className={styles.versionsWrap}>
      <div className={`${styles.inner} ${styles.versionsSection}`}>
        <h2 className={styles.versionsTitle}>إصدارات المجلة</h2>

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
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
