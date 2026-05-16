import MagazineTrafficDashboard from "@/app/components/magazine-traffic-dashboard";
import styles from "@/app/page.module.css";
import { adminCopy } from "@/lib/admin/ar-copy";

export const metadata = {
  title: adminCopy.trafficPage.metaTitle,
  description: adminCopy.trafficPage.metaDescription,
};

export default function TrafficPage() {
  return (
    <div className={styles.trafficPage}>
      <MagazineTrafficDashboard />
    </div>
  );
}
