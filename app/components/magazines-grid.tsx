import styles from "../magazines-grid.module.css";

interface MagazineCard {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
}

const magazines: MagazineCard[] = [
  {
    id: 1,
    title: "مجلة الدراسات التربوية والنفسية",
    description: "مجلة متخصصة في الدراسات التربوية والنفسية",
    image: "/images/magazine-placeholder.jpg",
    category: "إنسانيات"
  },
  {
    id: 2,
    title: "مجلة الدراسات التربوية والنفسية",
    description: "مجلة متخصصة في الدراسات التربوية والنفسية",
    image: "/images/magazine-placeholder.jpg",
    category: "إنسانيات"
  },
  {
    id: 3,
    title: "مجلة الدراسات التربوية والنفسية",
    description: "مجلة متخصصة في الدراسات التربوية والنفسية",
    image: "/images/magazine-placeholder.jpg",
    category: "إنسانيات"
  },
  {
    id: 4,
    title: "مجلة الدراسات التربوية والنفسية",
    description: "مجلة متخصصة في الدراسات التربوية والنفسية",
    image: "/images/magazine-placeholder.jpg",
    category: "إنسانيات"
  },
  {
    id: 5,
    title: "مجلة الدراسات التربوية والنفسية",
    description: "مجلة متخصصة في الدراسات التربوية والنفسية",
    image: "/images/magazine-placeholder.jpg",
    category: "عام"
  },
  {
    id: 6,
    title: "مجلة الدراسات التربوية والنفسية",
    description: "مجلة متخصصة في الدراسات التربوية والنفسية",
    image: "/images/magazine-placeholder.jpg",
    category: "عام"
  },
  {
    id: 7,
    title: "مجلة الدراسات التربوية والنفسية",
    description: "مجلة متخصصة في الدراسات التربوية والنفسية",
    image: "/images/magazine-placeholder.jpg",
    category: "عام"
  },
  {
    id: 8,
    title: "مجلة الدراسات التربوية والنفسية",
    description: "مجلة متخصصة في الدراسات التربوية والنفسية",
    image: "/images/magazine-placeholder.jpg",
    category: "عام"
  }
];

export default function MagazinesGrid() {
  return (
    <section className={styles.section}>
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
              <button className={styles.visitBtn}>
                <span>زيارة المجلة</span>
                <span>→</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
