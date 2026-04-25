import styles from "../magazines-grid.module.css";

interface MagazineCard {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  version: string;
}

const magazines: MagazineCard[] = [
  {
    id: 1,
    title: "مجلة الدراسات التربوية والنفسية",
    description: "مجلة متخصصة في الدراسات التربوية والنفسية",
    image: "/images/new-scientist.jpg",
    category: "إنسانيات",
    version: "1.0"
  },
  {
    id: 2,
    title: "مجلة الدراسات التربوية والنفسية",
    description: "مجلة متخصصة في الدراسات التربوية والنفسية",
    image: "/images/new-scientist.jpg",
    category: "إنسانيات",
    version: "1.1"
  },
  {
    id: 3,
    title: "مجلة الدراسات التربوية والنفسية",
    description: "مجلة متخصصة في الدراسات التربوية والنفسية",
    image: "/images/new-scientist.jpg",
    category: "إنسانيات",
    version: "1.2"
  }
];

export default function MagazinesGrid() {
  return (
    <section className={styles.section}>
      <h1 className={styles.versionsHeader}>إصدارات المجلة</h1>
      <div className={styles.grid}>
        {magazines.map((magazine) => (
          <div key={magazine.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              <img
                src={magazine.image}
                alt={magazine.title}
                className={styles.image}
              />
            </div>
            <div className={styles.content}>
              <h3 className={styles.title}>{magazine.title}</h3>
              <p className={styles.description}>{magazine.description}</p>
              <p className={styles.version}>الإصدار: {magazine.version}</p>
              <button className={styles.visitBtn}>
                <a href="../all-fields-page/magazine-page"><span>زيارة المجلة</span></a>
                <span>→</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
