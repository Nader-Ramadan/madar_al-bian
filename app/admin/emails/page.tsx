"use client";

import { FormEvent, useEffect, useState } from "react";
import styles from "@/app/page.module.css";

type EmailLog = {
  id: number;
  to: string;
  subject: string;
  status: string;
  sentAt: string;
};

export default function AdminEmailsPage() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInitial = async () => {
      const response = await fetch("/api/admin/emails");
      const payload = await response.json();
      setLogs(payload?.data ?? []);
    };
    loadInitial();
  }, []);

  const refreshLogs = async () => {
    const response = await fetch("/api/admin/emails");
    const payload = await response.json();
    setLogs(payload?.data ?? []);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/admin/emails/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, body }),
    });
    const payload = await response.json();
    if (!payload.success) {
      setError(payload.error || "Failed to send email");
      return;
    }
    setTo("");
    setSubject("");
    setBody("");
    await refreshLogs();
  };

  return (
    <div className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>Email Center</h1>
        <p className={styles.adminSubtitle}>Send operational messages and review delivery logs.</p>
      </header>

      <section className={styles.adminSection}>
        <form onSubmit={onSubmit} className={styles.adminForm}>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Recipient email"
            className={styles.adminInput}
          />
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className={styles.adminInput}
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Message"
            className={styles.adminTextarea}
          />
          <button type="submit" className={`${styles.adminButton} ${styles.adminButtonPrimary}`}>
            Send email
          </button>
        </form>
        {error ? <p className={styles.adminError}>{error}</p> : null}
      </section>

      <section className={styles.adminSection}>
        <h3 className={styles.adminSectionTitle}>Email Logs</h3>
        {logs.length === 0 ? (
          <p className={styles.adminEmpty}>No email logs yet.</p>
        ) : (
          <ul className={styles.adminList}>
            {logs.map((item) => (
              <li key={item.id} className={styles.adminListItem}>
                <span className={styles.adminListText}>
                  {item.to} - {item.subject} - {item.status}
                </span>
                <span className={styles.adminListText}>{new Date(item.sentAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
