"use client";

import { useEffect, useState } from "react";
import styles from "@/app/page.module.css";

export default function AdminContentPage() {
  const [counts, setCounts] = useState({ blogs: 0, conferences: 0, fields: 0 });

  useEffect(() => {
    const load = async () => {
      const [blogsRes, conferencesRes, fieldsRes] = await Promise.all([
        fetch("/api/blogs?limit=1"),
        fetch("/api/conferences?limit=1"),
        fetch("/api/fields?limit=1"),
      ]);
      const [blogs, conferences, fields] = await Promise.all([
        blogsRes.json(),
        conferencesRes.json(),
        fieldsRes.json(),
      ]);
      setCounts({
        blogs: blogs?.data?.pagination?.total ?? 0,
        conferences: conferences?.data?.pagination?.total ?? 0,
        fields: fields?.data?.pagination?.total ?? 0,
      });
    };
    load();
  }, []);

  return (
    <div className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>Content CRUD</h1>
        <p className={styles.adminSubtitle}>
          Use existing APIs to create, update, and remove core content entities.
        </p>
      </header>
      <section className={styles.adminSection}>
        <ul className={styles.adminList}>
          <li className={styles.adminListItem}>
            <span className={styles.adminListText}>Blogs</span>
            <span className={styles.adminListText}>{counts.blogs}</span>
          </li>
          <li className={styles.adminListItem}>
            <span className={styles.adminListText}>Conferences</span>
            <span className={styles.adminListText}>{counts.conferences}</span>
          </li>
          <li className={styles.adminListItem}>
            <span className={styles.adminListText}>Fields</span>
            <span className={styles.adminListText}>{counts.fields}</span>
          </li>
        </ul>
      </section>
      <section className={styles.adminSection}>
        <h3 className={styles.adminSectionTitle}>Endpoints</h3>
        <p className={styles.adminSubtitle}>/api/blogs, /api/conferences, /api/fields</p>
      </section>
    </div>
  );
}
