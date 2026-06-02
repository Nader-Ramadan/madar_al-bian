import Link from "next/link";
import styles from "../call-to-publish.module.css";

export default function CallToPublish() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>هل ترغب في نشر بحثك في إحدى مجلاتنا؟</h2>
        <p className={styles.subtitle}>
          تواصل معنا الآن واستشرنا في اختيار المجلة المناسبة لبحثك
        </p>
        <Link className={styles.button} href="/request-for-publication-of-a-study">
          ابدأ النشر
        </Link>
      </div>
    </section>
  );
}
