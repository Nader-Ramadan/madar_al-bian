import styles from "../magazines-grid.module.css";
import Image from 'next/image';
import Link from 'next/link';

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
    image: "/images/new-scientist.jpg",
    category: "إنسانيات"
  },
  {
    id: 2,
    title: "مجلة الدراسات التربوية والنفسية",
    description: "مجلة متخصصة في الدراسات التربوية والنفسية",
    image: "/images/new-scientist.jpg",
    category: "إنسانيات"
  },
  {
    id: 3,
    title: "مجلة الدراسات التربوية والنفسية",
    description: "مجلة متخصصة في الدراسات التربوية والنفسية",
    image: "/images/new-scientist.jpg",
    category: "إنسانيات"
  },
  {
    id: 4,
    title: "مجلة الدراسات التربوية والنفسية",
    description: "مجلة متخصصة في الدراسات التربوية والنفسية",
    image: "/images/new-scientist.jpg",
    category: "إنسانيات"
  },
  {
    id: 5,
    title: "مجلة الدراسات التربوية والنفسية",
    description: "مجلة متخصصة في الدراسات التربوية والنفسية",
    image: "/images/new-scientist.jpg",
    category: "عام"
  },
  {
    id: 6,
    title: "مجلة الدراسات التربوية والنفسية",
    description: "مجلة متخصصة في الدراسات التربوية والنفسية",
    image: "/images/new-scientist.jpg",
    category: "عام"
  },
  {
    id: 7,
    title: "مجلة الدراسات التربوية والنفسية",
    description: "مجلة متخصصة في الدراسات التربوية والنفسية",
    image: "/images/new-scientist.jpg",
    category: "عام"
  },
  {
    id: 8,
    title: "مجلة الدراسات التربوية والنفسية",
    description: "مجلة متخصصة في الدراسات التربوية والنفسية",
    image: "/images/new-scientist.jpg",
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
              <Image
                src={magazine.image}
                alt={magazine.title}
                width={400}
                height={300}
                className={styles.image}
              />
            </div>
            <div className={styles.content}>
              <h3 className={styles.title}>{magazine.title}</h3>
              <p className={styles.description}>{magazine.description}</p>
              <Link className={styles.visitBtn} href="../all-fields-page/magazine-page">
                <span>زيارة المجلة</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
