import styles from "../magazine-journal.module.css";

export type MagazinePublishingAdvisorItem = {
  id: number;
  photoUrl: string;
  name: string;
  jobTitle: string;
};

export default function MagazinePublishingAdvisors({
  advisors,
}: {
  advisors: MagazinePublishingAdvisorItem[];
}) {
  if (advisors.length === 0) return null;

  return (
    <section className={styles.advisorsSection} dir="rtl" aria-labelledby="magazine-advisors-heading">
      <div className={styles.advisorsInner}>
        <h2 id="magazine-advisors-heading" className={styles.advisorsTitle}>
          لجنة التحكيم
        </h2>
        <p className={styles.advisorsIntro}>أعضاء اللجنة الذين وافقوا على نشر هذه المجلة</p>
        <ul className={styles.advisorsGrid}>
          {advisors.map((a) => (
            <li key={a.id} className={styles.advisorCard}>
              <div className={styles.advisorAvatarWrap}>
                <img
                  className={styles.advisorAvatar}
                  src={a.photoUrl}
                  alt=""
                  width={120}
                  height={120}
                  loading="lazy"
                />
              </div>
              <h3 className={styles.advisorName}>{a.name}</h3>
              <p className={styles.advisorJob}>{a.jobTitle}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
