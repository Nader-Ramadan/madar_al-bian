"use client";

import { FormEvent, useEffect, useState } from "react";
import styles from "@/app/page.module.css";
import { adminCopy } from "@/lib/admin/ar-copy";
import { translateAdminApiMessage } from "@/lib/admin/api-error-ar";

type EmailLog = {
  id: number;
  to: string;
  subject: string;
  status: string;
  sentAt: string;
  error?: string | null;
};

export default function AdminEmailsPage() {
  const ep = adminCopy.emailsPage;
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const refreshLogs = async () => {
    const response = await fetch("/api/admin/emails");
    const payload = await response.json();
    setLogs(payload?.data ?? []);
  };

  useEffect(() => {
    refreshLogs();
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, body }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        setError(translateAdminApiMessage(payload.error || "Failed to send email"));
        return;
      }
      setTo("");
      setSubject("");
      setBody("");
      await refreshLogs();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>{ep.title}</h1>
        <p className={styles.adminSectionExplainer}>{ep.explainer}</p>
      </header>

      <section className={styles.adminSection}>
        <p className={styles.adminSectionExplainer}>{ep.composeExplainer}</p>
        <form onSubmit={onSubmit} className={styles.adminForm}>
          <input value={to} onChange={(e) => setTo(e.target.value)} placeholder={ep.placeholderTo} className={styles.adminInput} required />
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={ep.placeholderSubject} className={styles.adminInput} required />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={ep.placeholderBody} className={styles.adminTextarea} required />
          <button type="submit" className={`${styles.adminButton} ${styles.adminButtonPrimary}`} disabled={busy}>
            {busy ? ep.sending : ep.send}
          </button>
        </form>
        {error ? <p className={styles.adminError}>{error}</p> : null}
      </section>

      <section className={styles.adminSection}>
        <div className={styles.adminActions}>
          <h3 className={styles.adminSectionTitle}>{ep.logsTitle}</h3>
          <button type="button" className={styles.adminButton} onClick={refreshLogs}>
            {ep.refreshLogs}
          </button>
        </div>
        <p className={styles.adminSectionExplainer}>{ep.logsExplainer}</p>
        {logs.length === 0 ? (
          <p className={styles.adminEmpty}>{ep.emptyLogs}</p>
        ) : (
          <ul className={styles.adminList}>
            {logs.map((item) => (
              <li key={item.id} className={styles.adminListItem}>
                <span className={styles.adminListText}>
                  <strong>{item.to}</strong> — {item.subject} — {item.status}
                  {item.error ? (
                    <>
                      <br />
                      {ep.errorPrefix} {translateAdminApiMessage(item.error)}
                    </>
                  ) : null}
                </span>
                <span className={styles.adminListText}>{new Date(item.sentAt).toLocaleString("ar")}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
