import styles from "../all-fields-header.module.css";

export default function AllFieldsHeader() {
  return (
    <section className={styles.section}>
      <h1 className={styles.title}>كل المجلات</h1>
      <p className={styles.subtitle}>
        نقدم مجموعة متنوعة من المجلات المحكمة في مختلف التخصصات، جميعها معتمدة ومفهرسة
        في قواعد البيانات العالمية.
      </p>
    </section>
  );
}
