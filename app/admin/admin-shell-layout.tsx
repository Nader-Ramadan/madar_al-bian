"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/app/page.module.css";

const links = [
  { href: "/admin", label: "Dashboard Home", icon: "home" },
  { href: "/admin/magazines", label: "Magazines & Versions", icon: "book" },
  { href: "/admin/advisors", label: "Advisors", icon: "users" },
  { href: "/admin/approvals", label: "Publication Approvals", icon: "check" },
  { href: "/admin/emails", label: "Email Center", icon: "mail" },
  { href: "/admin/content", label: "Content CRUD", icon: "layers" },
  { href: "/admin/traffic", label: "Traffic Analytics", icon: "chart", badge: "Live" },
  { href: "/admin/account", label: "Account Security", icon: "shield" },
];

function NavIcon({ name }: { name: (typeof links)[number]["icon"] }) {
  const common = { className: styles.adminNavIcon, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true as const };
  if (name === "home") return <svg {...common}><path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.8v-5.5H9.8V21H5a1 1 0 0 1-1-1z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (name === "book") return <svg {...common}><path d="M5 6.5a2.5 2.5 0 0 1 2.5-2.5H19v15.2a1.8 1.8 0 0 1-1.8 1.8H7.5A2.5 2.5 0 0 1 5 18.5z" stroke="currentColor" strokeWidth="1.8" /><path d="M8.5 4v17" stroke="currentColor" strokeWidth="1.8" /><path d="M11 8h6M11 11.5h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  if (name === "users") return <svg {...common}><circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.8" /><path d="M3.8 19a5.2 5.2 0 0 1 10.4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M15 8.5a2.5 2.5 0 1 1 0 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M18.5 18.5a4 4 0 0 0-2.8-3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  if (name === "check") return <svg {...common}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="m8.5 12 2.2 2.2L15.8 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
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

  return (
    <div className={styles.page}>
      <main className={styles.adminShell}>
        <aside className={styles.adminSidebar}>
          <h2 className={styles.adminSidebarTitle}>Workspace</h2>
          <p className={styles.adminSidebarText}>Tools and content</p>
          <nav className={styles.adminNav}>
            {links.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
              return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.adminNavLink} ${isActive ? styles.adminNavLinkActive : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <NavIcon name={item.icon} />
                <span className={styles.adminNavLinkLabel}>{item.label}</span>
                {item.badge ? <span className={styles.adminNavBadge}>{item.badge}</span> : null}
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
