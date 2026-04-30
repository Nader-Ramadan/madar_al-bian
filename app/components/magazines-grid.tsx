"use client";
import styles from "../magazines-grid.module.css";
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from "react";

interface MagazineCard {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
}

export default function MagazinesGrid() {
  const [magazines, setMagazines] = useState<MagazineCard[]>([]);

  useEffect(() => {
    const fetchMagazines = async () => {
      try {
        const response = await fetch("/api/magazines?limit=12");
        const payload = await response.json();
        setMagazines(payload?.data?.items ?? []);
      } catch {
        setMagazines([]);
      }
    };
    fetchMagazines();
  }, []);

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
              <Link className={styles.visitBtn} href={`/magazines/${encodeURIComponent(magazine.title)}`}>
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
