import { Suspense } from "react";
import AdminMagazinesDashboard from "./magazines-dashboard.client";
import styles from "@/app/page.module.css";

function MagazinesDashboardFallback() {
  return (
    <div className={styles.adminPage} aria-busy="true">
      <header className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>Magazines Dashboard</h1>
        <p className={styles.adminSubtitle}>Loading…</p>
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
