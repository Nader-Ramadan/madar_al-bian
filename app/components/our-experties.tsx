import styles from '../page.module.css';

const expertiseItems = [
  {value: '100+', label: 'بحث منشور'},
  {value: '50+', label: 'باحث متعاون'},
  {value: '15+', label: 'مجلة علمية'},
  {value: '20+', label: 'مؤتمر دولي'},
];

export default function OurExperties() {
  return (
    <section className={styles.expertiseSection}>
      <div className={styles.expertiseGrid}>
        {expertiseItems.map((item) => (
          <article key={item.label} className={styles.expertiseCard}>
            <h3>{item.value}</h3>
            <p>{item.label}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
