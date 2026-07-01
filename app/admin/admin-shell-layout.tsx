"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/app/page.module.css";
import { adminCopy } from "@/lib/admin/ar-copy";

const links = [
  { href: "/admin", labelKey: "dashboardHome" as const, icon: "home" },
  { href: "/admin/magazines", labelKey: "magazines" as const, icon: "book" },
  { href: "/admin/researches", labelKey: "researches" as const, icon: "research" },
  { href: "/admin/advisors", labelKey: "advisors" as const, icon: "users" },
  { href: "/admin/approvals", labelKey: "approvals" as const, icon: "check" },
  { href: "/admin/publication-fee", labelKey: "publicationFee" as const, icon: "fee" },
  { href: "/admin/transactions", labelKey: "transactions" as const, icon: "fee" },
  { href: "/admin/emails", labelKey: "emails" as const, icon: "mail" },
  { href: "/admin/content", labelKey: "content" as const, icon: "layers" },
  { href: "/admin/traffic", labelKey: "traffic" as const, icon: "chart", badgeKey: "badgeLive" as const },
  { href: "/admin/account", labelKey: "account" as const, icon: "shield" },
];

function NavIcon({ name }: { name: (typeof links)[number]["icon"] }) {
  const common = { className: styles.adminNavIcon, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true as const };
  if (name === "home") return <svg {...common}><path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.8v-5.5H9.8V21H5a1 1 0 0 1-1-1z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (name === "book") return <svg {...common}><path d="M5 6.5a2.5 2.5 0 0 1 2.5-2.5H19v15.2a1.8 1.8 0 0 1-1.8 1.8H7.5A2.5 2.5 0 0 1 5 18.5z" stroke="currentColor" strokeWidth="1.8" /><path d="M8.5 4v17" stroke="currentColor" strokeWidth="1.8" /><path d="M11 8h6M11 11.5h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  if (name === "research")
    return (
      <svg {...common}>
        <path d="M8 4h11v17H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M11 9h8M11 13h8M11 17h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  if (name === "users") return <svg {...common}><circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.8" /><path d="M3.8 19a5.2 5.2 0 0 1 10.4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M15 8.5a2.5 2.5 0 1 1 0 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M18.5 18.5a4 4 0 0 0-2.8-3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  if (name === "check") return <svg {...common}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="m8.5 12 2.2 2.2L15.8 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (name === "fee") return <svg {...common}><rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  if (name === "mail") return <svg {...common}><rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="m4.4 7 7.6 5.7L19.6 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (name === "layers") return <svg {...common}><path d="m12 4.5 8 4.2-8 4.3-8-4.3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="m4 12.7 8 4.3 8-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (name === "chart") return <svg {...common}><path d="M5 19V9.5M12 19V5M19 19v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M4 19h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  return <svg {...common}><path d="M12 3.8 5 7.2v4.9c0 4 2.5 7.4 7 8.9 4.5-1.5 7-4.9 7-8.9V7.2z" stroke="currentColor" strokeWidth="1.8" /><path d="m9.2 12 1.8 1.9 3.8-3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const sb = adminCopy.sidebar;

  return (
    <div className={styles.page} lang="ar" dir="rtl">
      <main className={styles.adminShell}>
        <aside className={styles.adminSidebar}>
          <h2 className={styles.adminSidebarTitle}>{sb.workspaceTitle}</h2>
          <p className={styles.adminSidebarText}>{sb.workspaceSubtitle}</p>
          <nav className={styles.adminNav} aria-label={sb.workspaceTitle}>
            {links.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
              const label = sb[item.labelKey];
              const badge = item.badgeKey ? sb[item.badgeKey] : undefined;
              return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.adminNavLink} ${isActive ? styles.adminNavLinkActive : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <NavIcon name={item.icon} />
                <span className={styles.adminNavLinkLabel}>{label}</span>
                {badge ? <span className={styles.adminNavBadge}>{badge}</span> : null}
              </Link>
            );
            })}
          </nav>
        </aside>
        <section className={styles.adminContent}>{children}</section>
      </main>
    </div>
  );
}
