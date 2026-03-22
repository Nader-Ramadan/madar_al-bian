import styles from '../page.module.css';

function PublishAResearch() {
  return (
    <section className={styles.publishResearchSection}>
      <div className={styles.publishResearchContent}>
        <h2>هل لديك بحث علمي تود نشره؟</h2>
        <p>
          انضم إلى مجتمعنا من الباحثين والأكاديميين المتميزين وابدأ رحلتك في النشر العلمي معنا
        </p>
        <a className={styles.publishResearchButton} href="/submit-research">
          قدم بحثك الآن
        </a>
      </div>
    </section>
  );
}

export default PublishAResearch;
