import styles from "../call-to-publish.module.css";

export default function CallToPublish() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>هل ترغب في نشر بحثك في إحدى مجلاتنا؟</h2>
        <p className={styles.subtitle}>
          تواصل معنا الآن واستشرنا في اختيار المجلة المناسبة لبحثك
        </p>
        <button className={styles.button}>ابدأ النشر</button>
      </div>
    </section>
  );
}
