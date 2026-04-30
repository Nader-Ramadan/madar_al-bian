import Link from "next/link";
import styles from "@/app/page.module.css";

const links = [
  { href: "/admin", label: "Dashboard Home" },
  { href: "/admin/magazines", label: "Magazines & Versions" },
  { href: "/admin/advisors", label: "Advisors" },
  { href: "/admin/approvals", label: "Publication Approvals" },
  { href: "/admin/emails", label: "Email Center" },
  { href: "/admin/content", label: "Content CRUD" },
  { href: "/admin/traffic", label: "Traffic Analytics" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.page}>
      <main className={styles.adminShell}>
        <aside className={styles.adminSidebar}>
          <h2 className={styles.adminSidebarTitle}>Admin Panel</h2>
          <p className={styles.adminSidebarText}>Operations and editorial tools</p>
          <nav className={styles.adminNav}>
            {links.map((item) => (
              <Link key={item.href} href={item.href} className={styles.adminNavLink}>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <section className={styles.adminContent}>{children}</section>
      </main>
    </div>
  );
}
