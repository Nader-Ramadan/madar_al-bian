"use client";

import { useEffect, useState } from "react";
import styles from "@/app/page.module.css";

type PublicationRequest = {
  id: number;
  title: string;
  authorName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

export default function AdminApprovalsPage() {
  const [requests, setRequests] = useState<PublicationRequest[]>([]);

  useEffect(() => {
    const loadInitial = async () => {
      const response = await fetch("/api/admin/publication-requests");
      const payload = await response.json();
      setRequests(payload?.data ?? []);
    };
    loadInitial();
  }, []);

  const refresh = async () => {
    const response = await fetch("/api/admin/publication-requests");
    const payload = await response.json();
    setRequests(payload?.data ?? []);
  };

  const updateStatus = async (id: number, status: PublicationRequest["status"]) => {
    await fetch(`/api/admin/publication-requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await refresh();
  };

  return (
    <div className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>Publication Approvals</h1>
        <p className={styles.adminSubtitle}>Review, approve, or reject publication requests.</p>
      </header>
      <section className={styles.adminSection}>
        {requests.length === 0 ? (
          <p className={styles.adminEmpty}>No pending requests found.</p>
        ) : (
          <ul className={styles.adminList}>
            {requests.map((item) => (
              <li key={item.id} className={styles.adminListItem}>
                <span className={styles.adminListText}>
                  {item.title} - {item.authorName} - {item.status}
                </span>
                <div className={styles.adminActions}>
                  <button
                    type="button"
                    className={`${styles.adminButton} ${styles.adminButtonPrimary}`}
                    onClick={() => updateStatus(item.id, "APPROVED")}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className={`${styles.adminButton} ${styles.adminButtonDanger}`}
                    onClick={() => updateStatus(item.id, "REJECTED")}
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
