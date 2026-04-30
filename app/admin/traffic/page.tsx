import MagazineTrafficDashboard from '@/app/components/magazine-traffic-dashboard';
import styles from '@/app/page.module.css';

export const metadata = {
  title: 'Magazine Traffic Analytics',
  description: 'View and manage magazine traffic statistics',
};

export default function TrafficPage() {
  return (
    <div className={styles.trafficPage}>
      <MagazineTrafficDashboard />
    </div>
  );
}
