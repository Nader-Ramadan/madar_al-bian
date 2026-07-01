import Link from "next/link";
import { resolveMagazineContact } from "@/lib/magazine-contact-defaults";
import type { MagazineUiCopy } from "@/lib/magazine-ui-copy";
import { resolveMagazineAdvisorsCopy } from "@/lib/magazine-ui-copy-client";
import MagazinePublishingAdvisors, {
  type MagazinePublishingAdvisorItem,
} from "./magazine-publishing-advisors";
import styles from "../magazine-journal.module.css";

export type MagazineJournalContentProps = {
  copy: MagazineUiCopy;
  dateLocale: string;
  title: string;
  description: string;
  category: string;
  publishingAdvisors: MagazinePublishingAdvisorItem[];
  issn: string | null;
  impactFactor: string | null;
  currentVersion: string | null;
  nextVersionRelease: string | null;
  publicationPreference: string | null;
  versionMessage: string | null;
  certification: string | null;
  versionCount: number;
  magazineId?: number;
  publishingConditionsCount?: number;
  contactPhone?: string | null;
  contactPhoneTel?: string | null;
  contactEmail?: string | null;
  contactAddress?: string | null;
};

function formatNextRelease(iso: string | null, dateLocale: string, emDash: string): string {
  if (!iso) return emDash;
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return emDash;
    return new Intl.DateTimeFormat(dateLocale, {
      year: "numeric",
      month: "long",
    }).format(d);
  } catch {
    return emDash;
  }
}

function splitCategories(category: string, defaultCategory: string): string[] {
  const parts = category
    .split(/[,،]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [category.trim() || defaultCategory];
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

function IconBar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 20V10M18 20V4M6 20v-4" />
    </svg>
  );
}

export default function MagazineContent(props: MagazineJournalContentProps) {
  const {
    copy,
    dateLocale,
    title,
    description,
    category,
    issn,
    impactFactor,
    currentVersion,
    nextVersionRelease,
    publicationPreference,
    versionMessage,
    certification,
    versionCount,
    publishingAdvisors,
    magazineId,
    publishingConditionsCount = 0,
    contactPhone,
    contactPhoneTel,
    contactEmail,
    contactAddress,
  } = props;
  const showPublishingConditionsCta = magazineId != null && publishingConditionsCount > 0;
  const contact = resolveMagazineContact({
    contactPhone,
    contactPhoneTel,
    contactEmail,
    contactAddress,
  });

  const vision = publicationPreference?.trim() || copy.content.defaultVision;
  const mission = versionMessage?.trim() || copy.content.defaultMission;

  const fields = splitCategories(category, copy.content.defaultCategory);
  const emDash = copy.content.emDash;

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
              <div className={styles.quickValue}>{issn?.trim() || emDash}</div>
            </div>
          </div>
          <div className={styles.quickItem}>
            <div className={styles.quickIcon}>
              <IconChart />
            </div>
            <div>
              <div className={styles.quickLabel}>{copy.content.impactFactor}</div>
              <div className={styles.quickValue}>{impactFactor?.trim() || emDash}</div>
            </div>
          </div>
          <div className={styles.quickItem}>
            <div className={styles.quickIcon}>
              <IconCalendar />
            </div>
            <div>
              <div className={styles.quickLabel}>{copy.content.nextRelease}</div>
              <div className={styles.quickValue}>
                {formatNextRelease(nextVersionRelease, dateLocale, emDash)}
              </div>
            </div>
          </div>
          <div className={styles.quickCtaWrap}>
            <Link href="/request-for-publication-of-a-study" className={styles.quickCta}>
              <IconUpload />
              <span>{copy.content.submitResearch}</span>
            </Link>
          </div>
        </div>

        {showPublishingConditionsCta ? (
          <Link
            href={`/magazines/${magazineId}/publishing-conditions`}
            className={styles.publishingConditionsCta}
          >
            <span className={styles.publishingConditionsCtaIcon} aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="4" width="12" height="17" rx="2" />
                <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
                <path d="M9 10h6M9 14h6M9 18h4" />
              </svg>
            </span>
            <span className={styles.publishingConditionsCtaText}>
              <span className={styles.publishingConditionsCtaTitle}>
                {copy.content.publishingConditionsTitle}
              </span>
              <span className={styles.publishingConditionsCtaSubtitle}>
                {copy.content.publishingConditionsSubtitle(publishingConditionsCount)}
              </span>
            </span>
            <span className={styles.publishingConditionsCtaArrow} aria-hidden>
              {copy.content.publishingConditionsArrow}
            </span>
          </Link>
        ) : null}

        <div className={styles.grid}>
          <article className={`${styles.card} ${styles.cardWide}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <IconInfo />
              </div>
              <h2 className={styles.cardTitle}>{copy.content.aboutTitle(title)}</h2>
            </div>
            <div className={styles.cardBody}>
              {description.split(/\n\n+/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
              <h3 className={styles.fieldsHeading}>{copy.content.fieldsHeading}</h3>
              <ul className={styles.fieldList}>
                {fields.map((f) => (
                  <li key={f}>
                    <span className={styles.fieldBullet} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <IconPhone />
              </div>
              <h2 className={styles.cardTitle}>{copy.content.contactTitle}</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.contactRow}>
                <IconPhone />
                <div>
                  <div className={styles.quickLabel}>{copy.content.phone}</div>
                  {contact.phoneHref ? (
                    <a href={contact.phoneHref} target="_blank" rel="noopener noreferrer">
                      {contact.phone}
                    </a>
                  ) : (
                    <span>{contact.phone}</span>
                  )}
                </div>
              </div>
              <div className={styles.contactRow}>
                <IconMail />
                <div>
                  <div className={styles.quickLabel}>{copy.content.email}</div>
                  <a href={contact.emailHref}>{contact.email}</a>
                </div>
              </div>
              <div className={styles.contactRow}>
                <IconMap />
                <div>
                  <div className={styles.quickLabel}>{copy.content.address}</div>
                  <span>{contact.address}</span>
                </div>
              </div>
            </div>
          </article>

          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <IconEye />
              </div>
              <h2 className={styles.cardTitle}>{copy.content.visionMissionTitle}</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.split}>
                <div className={styles.splitBlock}>
                  <h4>{copy.content.vision}</h4>
                  <p>{vision}</p>
                </div>
                <div className={styles.splitBlock}>
                  <h4>{copy.content.mission}</h4>
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
              <h2 className={styles.cardTitle}>{copy.content.accreditationTitle}</h2>
            </div>
            <div className={styles.cardBody}>
              {certification?.trim() ? (
                <p className={styles.accreditText}>{certification.trim()}</p>
              ) : (
                <p className={styles.accreditPlaceholder}>{copy.content.accreditationPlaceholder}</p>
              )}
            </div>
          </article>

          <div className={styles.cardSpanAll}>
            <MagazinePublishingAdvisors
              advisors={publishingAdvisors}
              copy={resolveMagazineAdvisorsCopy(copy)}
            />
          </div>

          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderIcon}>
                <IconBar />
              </div>
              <h2 className={styles.cardTitle}>{copy.content.statsTitle}</h2>
            </div>
            <div className={styles.cardBody}>
              <ul className={styles.statList}>
                <li>
                  <span className={styles.statLabel}>{copy.content.statVersions}</span>
                  <span className={styles.statValue}>{versionCount}</span>
                </li>
                <li>
                  <span className={styles.statLabel}>{copy.content.statCurrentVersion}</span>
                  <span className={styles.statValue}>{currentVersion?.trim() || emDash}</span>
                </li>
                <li>
                  <span className={styles.statLabel}>{copy.content.statNextRelease}</span>
                  <span className={styles.statValue}>
                    {formatNextRelease(nextVersionRelease, dateLocale, emDash)}
                  </span>
                </li>
                <li>
                  <span className={styles.statLabel}>{copy.content.statImpactFactor}</span>
                  <span className={styles.statValue}>{impactFactor?.trim() || emDash}</span>
                </li>
              </ul>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
