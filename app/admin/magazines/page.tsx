import { Suspense } from "react";
import AdminMagazinesDashboard from "./magazines-dashboard.client";
import styles from "@/app/page.module.css";
import { adminCopy } from "@/lib/admin/ar-copy";

function MagazinesDashboardFallback() {
  const ac = adminCopy.magazines;
  return (
    <div className={styles.adminPage} aria-busy="true">
      <header className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>{ac.pageTitle}</h1>
        <p className={styles.adminSubtitle}>{ac.pageFallbackSubtitle}</p>
      </header>
    </div>
  );
}

export default function AdminMagazinesPage() {
  return (
    <Suspense fallback={<MagazinesDashboardFallback />}>
      <AdminMagazinesDashboard />
    </Suspense>
  );
}
