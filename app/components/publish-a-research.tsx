import styles from '../page.module.css';
import Link from 'next/link';

function PublishAResearch() {
  return (
    <section className={styles.publishResearchSection}>
      <div className={styles.publishResearchContent}>
        <h2>هل لديك بحث علمي تود نشره؟</h2>
        <p>
          انضم إلى مجتمعنا من الباحثين والأكاديميين المتميزين وابدأ رحلتك في النشر العلمي معنا
        </p>
        <Link className={styles.publishResearchButton} href="/request-for-publication-of-a-study">
          قدم بحثك الآن
        </Link>
      </div>
    </section>
  );
}

export default PublishAResearch;
