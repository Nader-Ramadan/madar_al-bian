"use client";

import { useEffect, useState } from "react";
import styles from "@/app/page.module.css";
import { adminCopy } from "@/lib/admin/ar-copy";

type PublicationRequest = {
  id: number;
  title: string;
  authorName: string;
  authorEmail: string;
  authorPhone?: string | null;
  abstract: string;
  field?: string | null;
  magazineId?: number | null;
  magazine?: { id: number; title: string } | null;
  documentUrl?: string | null;
  documentFilename?: string | null;
  reviewNotes?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
};

function formatSubmittedAt(iso: string) {
  try {
    return new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

function abstractExcerpt(text: string, max = 160) {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

function statusLabelAr(status: PublicationRequest["status"]) {
  const ap = adminCopy.approvalsPage;
  switch (status) {
    case "PENDING":
      return ap.statusPending;
    case "APPROVED":
      return ap.statusApproved;
    case "REJECTED":
      return ap.statusRejected;
    default:
      return status;
  }
}

export default function AdminApprovalsPage() {
  const ap = adminCopy.approvalsPage;
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
        <h1 className={styles.adminTitle}>{ap.title}</h1>
        <p className={styles.adminSectionExplainer}>{ap.explainer}</p>
      </header>
      <section className={styles.adminSection}>
        {requests.length === 0 ? (
          <p className={styles.adminEmpty}>{ap.empty}</p>
        ) : (
          <ul className={styles.adminList}>
            {requests.map((item) => (
              <li key={item.id} className={styles.adminListItem}>
                <span className={styles.adminListText}>
                  <strong>{item.title}</strong> — {item.authorName} ({item.authorEmail})
                  <br />
                  {item.authorPhone ? (
                    <>
                      {ap.phoneLabel}{" "}
                      <a href={`tel:${item.authorPhone.replace(/\s/g, "")}`}>{item.authorPhone}</a>
                      <br />
                    </>
                  ) : null}
                  {item.magazine ? (
                    <>
                      المجلة: <strong>{item.magazine.title}</strong>
                      <br />
                    </>
                  ) : null}
                  {ap.statusLabel} {statusLabelAr(item.status)}
                  <br />
                  {ap.submittedAt} {formatSubmittedAt(item.createdAt)}
                  <br />
                  {ap.abstractLabel} {abstractExcerpt(item.abstract)}
                  <br />
                  {item.documentUrl ? (
                    <a
                      href={`/api/admin/publication-requests/${item.id}/document`}
                      className={styles.adminButton}
                      style={{ display: "inline-flex", marginTop: "0.5rem" }}
                      download={item.documentFilename ?? undefined}
                    >
                      {ap.downloadWord}
                      {item.documentFilename ? ` (${item.documentFilename})` : ""}
                    </a>
                  ) : (
                    <span style={{ display: "block", marginTop: "0.5rem", opacity: 0.75 }}>
                      {ap.noAttachment}
                    </span>
                  )}
                </span>
                <div className={`${styles.adminForm} ${styles.adminFormInList}`}>
                  <textarea
                    className={styles.adminTextarea}
                    placeholder={ap.placeholderNotes}
                    value={notesById[item.id] ?? item.reviewNotes ?? ""}
                    onChange={(e) => setNotesById((s) => ({ ...s, [item.id]: e.target.value }))}
                  />
                  <div className={styles.adminActions}>
                    <button
                      type="button"
                      className={`${styles.adminButton} ${styles.adminButtonPrimary}`}
                      disabled={busy}
                      onClick={() => updateStatus(item.id, "APPROVED")}
                    >
                      {ap.approve}
                    </button>
                    <button
                      type="button"
                      className={`${styles.adminButton} ${styles.adminButtonDanger}`}
                      disabled={busy}
                      onClick={() => updateStatus(item.id, "REJECTED")}
                    >
                      {ap.reject}
                    </button>
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
