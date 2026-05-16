"use client";

import { useEffect, useState } from "react";
import styles from "@/app/page.module.css";
import { adminCopy } from "@/lib/admin/ar-copy";
import { translateAdminApiMessage } from "@/lib/admin/api-error-ar";

interface TrafficStats {
  magazineId: number;
  magazineTitle: string;
  views: number;
  downloads: number;
  shares: number;
}

export default function MagazineTrafficDashboard() {
  const td = adminCopy.trafficDashboard;
  const [stats, setStats] = useState<TrafficStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchTraffic = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(`/api/magazines/traffic?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setStats(result.data.stats);
      } else {
        setError(translateAdminApiMessage("Failed to fetch traffic data"));
      }
    } catch (err) {
      setError(translateAdminApiMessage("Error fetching traffic data"));
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
        <h1 className={styles.trafficTitle}>{td.title}</h1>
        <p className={styles.adminSectionExplainer}>{td.explainer}</p>
      </header>

      <section className={styles.filterCard}>
        <div className={styles.filterSection}>
          <div>
            <label htmlFor="startDate">{td.startDate}</label>
            <input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>

          <div>
            <label htmlFor="endDate">{td.endDate}</label>
            <input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>

          <button type="button" onClick={handleFilter}>
            {td.applyFilter}
          </button>
        </div>
      </section>

      {loading && <p className={styles.stateCard}>{td.loading}</p>}
      {error && <p className={styles.errorStateCard}>{error}</p>}

      {hasStats && (
        <section className={styles.tableCard}>
          <div className={styles.tableScroller}>
            <table className={styles.trafficTable}>
              <thead>
                <tr>
                  <th>{td.colMagazine}</th>
                  <th>{td.colViews}</th>
                  <th>{td.colDownloads}</th>
                  <th>{td.colShares}</th>
                  <th>{td.colTotal}</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((stat) => (
                  <tr key={stat.magazineId}>
                    <td data-label={td.colMagazine}>{stat.magazineTitle}</td>
                    <td data-label={td.colViews}>{stat.views}</td>
                    <td data-label={td.colDownloads}>{stat.downloads}</td>
                    <td data-label={td.colShares}>{stat.shares}</td>
                    <td data-label={td.colTotal}>{stat.views + stat.downloads + stat.shares}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {hasNoStats && <p className={styles.stateCard}>{td.emptyRange}</p>}
    </section>
  );
}
