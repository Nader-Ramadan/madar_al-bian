import Image from "next/image";
import Link from "next/link";
import styles from "../magazine-journal.module.css";

export type MagazineJournalContentProps = {
  title: string;
  description: string;
  image: string;
  category: string;
  issn: string | null;
  impactFactor: string | null;
  currentVersion: string | null;
  nextVersionRelease: string | null;
  publicationPreference: string | null;
  versionMessage: string | null;
  certification: string | null;
  versionCount: number;
};

function formatNextRelease(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "long",
    }).format(d);
  } catch {
    return "—";
  }
}

function splitCategories(category: string): string[] {
  const parts = category
    .split(/[,،]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [category.trim() || "متعدد التخصصات"];
}

function IconBook() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function IconUpload() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" aria-hidden>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function IconMap() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" aria-hidden>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconAward() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  );
}

function IconLayers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function IconBar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 20V10M18 20V4M6 20v-4" />
    </svg>
  );
}

export default function MagazineContent(props: MagazineJournalContentProps) {
  const {
    title,
    description,
    image,
    category,
    issn,
    impactFactor,
    currentVersion,
    nextVersionRelease,
    publicationPreference,
    versionMessage,
    certification,
    versionCount,
  } = props;

  const vision =
    publicationPreference?.trim() ||
    "نسعى إلى الريادة في نشر المعرفة الأكاديمية الرصينة في مجالات تخصص المجلة.";
  const mission =
    versionMessage?.trim() ||
    "دعم الباحثين بعملية تحكيم مهنية وتقديم محتوى مفتوح الوصول يعكس معايير الجودة العالمية.";

  const fields = splitCategories(category);

  return (
    <div className={styles.shell}>
      <div className={styles.inner}>
        <div className={styles.quickBar}>
          <div className={styles.quickItem}>
            <div className={styles.quickIcon}>
              <IconBook />
            </div>
            <div>
              <div className={styles.quickLabel}>ISSN</div>
              <div className={styles.quickValue}>{issn?.trim() || "—"}</div>
            </div>
          </div>
          <div className={styles.quickItem}>
            <div className={styles.quickIcon}>
              <IconChart />
            </div>
            <div>
              <div className={styles.quickLabel}>معامل التأثير</div>
              <div className={styles.quickValue}>{impactFactor?.trim() || "—"}</div>
            </div>
          </div>
          <div className={styles.quickItem}>
            <div className={styles.quickIcon}>
              <IconCalendar />
            </div>
            <div>
              <div className={styles.quickLabel}>الإصدار القادم</div>
              <div className={styles.quickValue}>{formatNextRelease(nextVersionRelease)}</div>
            </div>
          </div>
          <div className={styles.quickCtaWrap}>
            <Link href="/request-for-publication-of-a-study" className={styles.quickCta}>
              <IconUpload />
              <span>قدّم بحثك</span>
            </Link>
          </div>
        </div>

        <div className={styles.grid}>
          <article className={`${styles.card} ${styles.cardWide}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <IconInfo />
              </div>
              <h2 className={styles.cardTitle}>عن المجلة: {title}</h2>
            </div>
            <div className={styles.cardBody}>
              {description.split(/\n\n+/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </article>

          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <IconPhone />
              </div>
              <h2 className={styles.cardTitle}>معلومات التواصل</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.contactRow}>
                <IconPhone />
                <div>
                  <div className={styles.quickLabel}>الهاتف</div>
                  <a href="tel:+201066223399">٠٠٢ +١٠٦٦٢٢٣٣٩٩</a>
                </div>
              </div>
              <div className={styles.contactRow}>
                <IconMail />
                <div>
                  <div className={styles.quickLabel}>البريد</div>
                  <a href="mailto:info@madar-albian.com">info@madar-albian.com</a>
                </div>
              </div>
              <div className={styles.contactRow}>
                <IconMap />
                <div>
                  <div className={styles.quickLabel}>العنوان</div>
                  <span>٢٠٣ شارع ماونتن فيو، الجيزة، جمهورية مصر العربية</span>
                </div>
              </div>
            </div>
          </article>

          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <IconEye />
              </div>
              <h2 className={styles.cardTitle}>الرؤية والرسالة</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.split}>
                <div className={styles.splitBlock}>
                  <h4>الرؤية</h4>
                  <p>{vision}</p>
                </div>
                <div className={styles.splitBlock}>
                  <h4>الرسالة</h4>
                  <p>{mission}</p>
                </div>
              </div>
            </div>
          </article>

          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <IconAward />
              </div>
              <h2 className={styles.cardTitle}>الاعتمادات والفهرسة</h2>
            </div>
            <div className={styles.cardBody}>
              {certification?.trim() ? (
                <p className={styles.accreditText}>{certification.trim()}</p>
              ) : (
                <p className={styles.accreditPlaceholder}>
                  تفاصيل الاعتمادات والفهرسة تُحدَّث من إدارة المجلة. تواصل معنا للاستفسار.
                </p>
              )}
            </div>
          </article>

          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <IconLayers />
              </div>
              <h2 className={styles.cardTitle}>مجالات النشر</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.publishRow}>
                <div className={styles.publishCover}>
                  <Image src={image} alt={title} width={200} height={280} sizes="100px" />
                </div>
                <ul className={styles.fieldList}>
                  {fields.map((f) => (
                    <li key={f}>
                      <span className={styles.fieldBullet} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>

          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <IconBar />
              </div>
              <h2 className={styles.cardTitle}>إحصائيات المجلة</h2>
            </div>
            <div className={styles.cardBody}>
              <ul className={styles.statList}>
                <li>
                  <span className={styles.statLabel}>إصدارات مسجّلة</span>
                  <span className={styles.statValue}>{versionCount}</span>
                </li>
                <li>
                  <span className={styles.statLabel}>الإصدار الحالي</span>
                  <span className={styles.statValue}>{currentVersion?.trim() || "—"}</span>
                </li>
                <li>
                  <span className={styles.statLabel}>موعد الإصدار القادم</span>
                  <span className={styles.statValue}>{formatNextRelease(nextVersionRelease)}</span>
                </li>
                <li>
                  <span className={styles.statLabel}>معامل التأثير</span>
                  <span className={styles.statValue}>{impactFactor?.trim() || "—"}</span>
                </li>
              </ul>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
