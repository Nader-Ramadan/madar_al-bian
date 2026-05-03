"use client";

import Link from "next/link";
import styles from "@/app/page.module.css";

export default function AdminDashboardPage() {
  const modules = [
    { href: "/admin/magazines", title: "Magazines & Versions", desc: "Create magazines and manage version releases." },
    { href: "/admin/advisors", title: "Advisors", desc: "Add, edit, and remove advisory members." },
    { href: "/admin/approvals", title: "Publication Approvals", desc: "Review and approve publication requests." },
    { href: "/admin/emails", title: "Email Center", desc: "Send operational and editorial emails." },
    { href: "/admin/content", title: "Content", desc: "Manage blogs, conferences, and fields." },
    { href: "/admin/traffic", title: "Traffic Analytics", desc: "Review magazine views and engagement." },
  ];

  return (
    <div className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>Workspace home</h1>
        <p className={styles.adminSubtitle}>
          Publishing workflows, people, and site content in one place.
        </p>
      </header>
      <div className={styles.adminGrid}>
        {modules.map((module) => (
          <Link key={module.href} href={module.href} className={styles.adminCard}>
            <h3 className={styles.adminCardTitle}>{module.title}</h3>
            <p className={styles.adminCardText}>{module.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
