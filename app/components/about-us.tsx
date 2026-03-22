import styles from '../page.module.css';

export default function AboutUs() {
  return (
    <section className={styles.aboutUsSection}>
      <div className={styles.aboutUsContent}>
        <h2>من نحن</h2>
        <p>
          مؤسسة رائدة في مجال النشر العلمي والبحث الأكاديمي في العالم العربي. نقدم خدمات
          دعم الباحثين من النشر والتحكيم العلمي إلى تسهيل الوصول إلى المعرفة الموثوقة.
        </p>
        <div className={styles.aboutUsCards}>
          <article className={styles.aboutUsCard}>
            <span className={styles.aboutUsIcon}>📚</span>
            <h3>500+ بحث محكم</h3>
            <p>سجل حافل بالإنجازات في مراجعة الأبحاث وضمان الجودة.</p>
          </article>
          <article className={styles.aboutUsCard}>
            <span className={styles.aboutUsIcon}>🏅</span>
            <h3>15+ تخصص علمي</h3>
            <p>نغطي طيفاً واسعاً من التخصصات العلمية والهندسية والطبية.</p>
          </article>
          <article className={styles.aboutUsCard}>
            <span className={styles.aboutUsIcon}>🎓</span>
            <h3>30+ عضو لجنة استشارية</h3>
            <p>خبراء أكاديميون عالميون يضمنون مصداقية وجودة النشر.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
