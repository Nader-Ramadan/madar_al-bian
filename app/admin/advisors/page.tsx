"use client";

import { useEffect, useState } from "react";
import styles from "@/app/page.module.css";

type Advisor = { id: number; name: string; title: string };

export default function AdminAdvisorsPage() {
  const [items, setItems] = useState<Advisor[]>([]);

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/advisory-members?limit=100");
      const payload = await response.json();
      setItems(payload?.data?.items ?? []);
    };
    load();
  }, []);

  return (
    <div className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>Advisors Management</h1>
        <p className={styles.adminSubtitle}>Review advisory members and specialties.</p>
      </header>
      <section className={styles.adminSection}>
        {items.length === 0 ? (
          <p className={styles.adminEmpty}>No advisors found.</p>
        ) : (
          <ul className={styles.adminList}>
            {items.map((item) => (
              <li key={item.id} className={styles.adminListItem}>
                <span className={styles.adminListText}>{item.name}</span>
                <span className={styles.adminListText}>{item.title}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
