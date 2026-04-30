"use client";

import { useEffect, useState } from "react";
import styles from "@/app/page.module.css";

type Magazine = {
  id: number;
  title: string;
  category: string;
};

type MagazineVersion = {
  id: number;
  magazineId: number;
  version: string;
  releaseDate: string;
};

export default function AdminMagazinesPage() {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [versions, setVersions] = useState<MagazineVersion[]>([]);

  useEffect(() => {
    const load = async () => {
      const magazinesResponse = await fetch("/api/magazines?limit=50");
      const magazinesPayload = await magazinesResponse.json();
      setMagazines(magazinesPayload?.data?.items ?? []);

      const versionsResponse = await fetch("/api/admin/magazine-versions");
      const versionsPayload = await versionsResponse.json();
      setVersions(versionsPayload?.data ?? []);
    };
    load();
  }, []);

  return (
    <div className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>Magazines & Versions</h1>
        <p className={styles.adminSubtitle}>
          Manage magazine records and issue/version releases.
        </p>
      </header>

      <section className={styles.adminSection}>
        <h3 className={styles.adminSectionTitle}>Magazines</h3>
        {magazines.length === 0 ? (
          <p className={styles.adminEmpty}>No magazines found.</p>
        ) : (
          <ul className={styles.adminList}>
            {magazines.map((item) => (
              <li key={item.id} className={styles.adminListItem}>
                <span className={styles.adminListText}>{item.title}</span>
                <span className={styles.adminListText}>{item.category}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.adminSection}>
        <h3 className={styles.adminSectionTitle}>Versions</h3>
        {versions.length === 0 ? (
          <p className={styles.adminEmpty}>No versions found.</p>
        ) : (
          <ul className={styles.adminList}>
            {versions.map((item) => (
              <li key={item.id} className={styles.adminListItem}>
                <span className={styles.adminListText}>
                  Magazine #{item.magazineId} - v{item.version}
                </span>
                <span className={styles.adminListText}>
                  {new Date(item.releaseDate).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
