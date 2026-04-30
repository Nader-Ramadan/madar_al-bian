'use client';

import { useEffect, useState } from 'react';
import styles from '@/app/page.module.css';

interface TrafficStats {
  magazineId: number;
  magazineTitle: string;
  views: number;
  downloads: number;
  shares: number;
}

export default function MagazineTrafficDashboard() {
  const [stats, setStats] = useState<TrafficStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchTraffic = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/magazines/traffic?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setStats(result.data.stats);
      } else {
        setError('Failed to fetch traffic data');
      }
    } catch (err) {
      setError('Error fetching traffic data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTraffic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = () => {
    fetchTraffic();
  };

  const hasStats = !loading && stats.length > 0;
  const hasNoStats = !loading && stats.length === 0 && !error;

  return (
    <section className={styles.container}>
      <header className={styles.trafficHeader}>
        <h1 className={styles.trafficTitle}>Magazine Traffic Dashboard</h1>
        <p className={styles.trafficSubtitle}>
          Track engagement, compare interactions, and filter by date range.
        </p>
      </header>

      <section className={styles.filterCard}>
        <div className={styles.filterSection}>
          <div>
            <label htmlFor="startDate">Start Date:</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="endDate">End Date:</label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <button onClick={handleFilter}>Apply Filter</button>
        </div>
      </section>

      {loading && <p className={styles.stateCard}>Loading traffic data...</p>}
      {error && <p className={styles.errorStateCard}>{error}</p>}

      {hasStats && (
        <section className={styles.tableCard}>
          <div className={styles.tableScroller}>
            <table className={styles.trafficTable}>
              <thead>
                <tr>
                  <th>Magazine Title</th>
                  <th>Views</th>
                  <th>Downloads</th>
                  <th>Shares</th>
                  <th>Total Interactions</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((stat) => (
                  <tr key={stat.magazineId}>
                    <td data-label="Magazine Title">{stat.magazineTitle}</td>
                    <td data-label="Views">{stat.views}</td>
                    <td data-label="Downloads">{stat.downloads}</td>
                    <td data-label="Shares">{stat.shares}</td>
                    <td data-label="Total Interactions">
                      {stat.views + stat.downloads + stat.shares}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {hasNoStats && (
        <p className={styles.stateCard}>
          No traffic data available for this range.
        </p>
      )}
    </section>
  );
}
