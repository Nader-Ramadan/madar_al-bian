"use client";

import { useEffect, useState } from "react";
import styles from "@/app/page.module.css";

type PublicationRequest = {
  id: number;
  title: string;
  authorName: string;
  authorEmail: string;
  abstract: string;
  field?: string | null;
  reviewNotes?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

export default function AdminApprovalsPage() {
  const [requests, setRequests] = useState<PublicationRequest[]>([]);
  const [notesById, setNotesById] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const response = await fetch("/api/admin/publication-requests");
    const payload = await response.json();
    setRequests(payload?.data ?? []);
  };

  useEffect(() => {
    refresh();
  }, []);

  const updateStatus = async (id: number, status: PublicationRequest["status"]) => {
    setBusy(true);
    try {
      await fetch(`/api/admin/publication-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewNotes: notesById[id] ?? null }),
      });
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>Publication Approvals</h1>
        <p className={styles.adminSubtitle}>Review requests, set notes, and approve or reject.</p>
      </header>
      <section className={styles.adminSection}>
        {requests.length === 0 ? (
          <p className={styles.adminEmpty}>No requests found.</p>
        ) : (
          <ul className={styles.adminList}>
            {requests.map((item) => (
              <li key={item.id} className={styles.adminListItem}>
                <span className={styles.adminListText}>
                  <strong>{item.title}</strong> - {item.authorName} ({item.authorEmail})<br />
                  Status: {item.status}
                </span>
                <div className={styles.adminForm} style={{ minWidth: 300 }}>
                  <textarea
                    className={styles.adminTextarea}
                    placeholder="Review notes"
                    value={notesById[item.id] ?? item.reviewNotes ?? ""}
                    onChange={(e) => setNotesById((s) => ({ ...s, [item.id]: e.target.value }))}
                  />
                  <div className={styles.adminActions}>
                    <button type="button" className={`${styles.adminButton} ${styles.adminButtonPrimary}`} disabled={busy} onClick={() => updateStatus(item.id, "APPROVED")}>Approve</button>
                    <button type="button" className={`${styles.adminButton} ${styles.adminButtonDanger}`} disabled={busy} onClick={() => updateStatus(item.id, "REJECTED")}>Reject</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
