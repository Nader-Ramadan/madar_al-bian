import Image from "next/image";
import styles from "../magazine-journal.module.css";

export type MagazinePublishingAdvisorItem = {
  id: number;
  photoUrl: string;
  name: string;
  jobTitle: string;
};

function needsUnoptimizedAsset(src: string) {
  return (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("/uploads/")
  );
}

function IconEyeHeader() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function MagazinePublishingAdvisors({
  advisors,
  showIntro = false,
}: {
  advisors: MagazinePublishingAdvisorItem[];
  showIntro?: boolean;
}) {
  if (advisors.length === 0) return null;

  return (
    <section className={styles.advisorsSection} dir="rtl" aria-labelledby="magazine-advisors-heading">
      <div className={styles.advisorsCardFrame}>
        <div className={styles.advisorsCardHeader}>
          <div className={styles.advisorsCardHeaderIcon}>
            <IconEyeHeader />
          </div>
          <h2 id="magazine-advisors-heading" className={styles.advisorsCardTitle}>
            لجنة التحكيم
          </h2>
        </div>
        <div className={styles.advisorsCardBody}>
          <div className={styles.advisorsInner}>
            {showIntro ? (
              <p className={styles.advisorsIntro}>أعضاء اللجنة الذين وافقوا على نشر هذه المجلة</p>
            ) : null}
            <ul className={styles.advisorsGrid}>
              {advisors.map((a) => (
                <li key={a.id} className={styles.advisorCard}>
                  <div className={styles.advisorAvatarWrap}>
                    <Image
                      className={styles.advisorAvatar}
                      src={a.photoUrl}
                      alt=""
                      fill
                      sizes="(max-width: 480px) 33vw, (max-width: 900px) 25vw, 112px"
                      unoptimized={needsUnoptimizedAsset(a.photoUrl)}
                    />
                  </div>
                  <h3 className={styles.advisorName}>{a.name}</h3>
                  <p className={styles.advisorJob}>{a.jobTitle}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
