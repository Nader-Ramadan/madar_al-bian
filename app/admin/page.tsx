"use client";

import Link from "next/link";
import styles from "@/app/page.module.css";
import { adminCopy } from "@/lib/admin/ar-copy";

function DashboardIcon({ kind }: { kind: "magazine" | "advisor" | "approval" | "email" | "content" | "traffic" }) {
  const common = { className: styles.adminSectionIcon, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true as const };
  if (kind === "magazine") return <svg {...common}><path d="M5 6.5A2.5 2.5 0 0 1 7.5 4H19v15a2 2 0 0 1-2 2H7.5A2.5 2.5 0 0 1 5 18.5z" stroke="currentColor" strokeWidth="1.8" /><path d="M8.5 4v17M11 8h6M11 12h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  if (kind === "advisor") return <svg {...common}><circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.8" /><path d="M4 19a5 5 0 0 1 10 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M15 9a2.5 2.5 0 1 1 0 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  if (kind === "approval") return <svg {...common}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="m8.8 12.3 2.1 2.2L15.8 9.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (kind === "email") return <svg {...common}><rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="m4.5 7 7.5 5.6L19.5 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (kind === "content") return <svg {...common}><path d="m12 4.2 8 4.5-8 4.5-8-4.5z" stroke="currentColor" strokeWidth="1.8" /><path d="m4 12.8 8 4.5 8-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  return <svg {...common}><path d="M5 19V9.5M12 19V5M19 19v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M4 19h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

export default function AdminDashboardPage() {
  const dh = adminCopy.dashboardHome;
  const modules = [
    { href: "/admin/magazines", title: dh.moduleMagazinesTitle, desc: dh.moduleMagazinesDesc, kind: "magazine" as const },
    { href: "/admin/advisors", title: dh.moduleAdvisorsTitle, desc: dh.moduleAdvisorsDesc, kind: "advisor" as const },
    { href: "/admin/approvals", title: dh.moduleApprovalsTitle, desc: dh.moduleApprovalsDesc, kind: "approval" as const },
    { href: "/admin/emails", title: dh.moduleEmailsTitle, desc: dh.moduleEmailsDesc, kind: "email" as const },
    { href: "/admin/content", title: dh.moduleContentTitle, desc: dh.moduleContentDesc, kind: "content" as const },
    { href: "/admin/traffic", title: dh.moduleTrafficTitle, desc: dh.moduleTrafficDesc, kind: "traffic" as const },
  ];

  return (
    <div className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>{dh.title}</h1>
        <p className={styles.adminSectionExplainer}>{dh.explainer}</p>
      </header>
      <section className={styles.adminStatusGrid} aria-label={dh.statusAria}>
        <div className={styles.adminStatusCard}>
          <p className={styles.adminStatusLabel}>{dh.coreModules}</p>
          <p className={styles.adminStatusValue}>{modules.length}</p>
        </div>
        <div className={styles.adminStatusCard}>
          <p className={styles.adminStatusLabel}>{dh.navCoverage}</p>
          <p className={styles.adminStatusValue}>100%</p>
        </div>
        <div className={styles.adminStatusCard}>
          <p className={styles.adminStatusLabel}>{dh.currentMode}</p>
          <p className={styles.adminStatusValue}>{dh.operational}</p>
        </div>
      </section>
      <div className={styles.adminGrid}>
        {modules.map((module) => (
          <Link key={module.href} href={module.href} className={styles.adminCard}>
            <div className={styles.adminCardIconWrap}>
              <DashboardIcon kind={module.kind} />
            </div>
            <h3 className={styles.adminCardTitle}>{module.title}</h3>
            <p className={styles.adminCardText}>{module.desc}</p>
            <span className={styles.adminCardFooter}>{dh.openModule}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
