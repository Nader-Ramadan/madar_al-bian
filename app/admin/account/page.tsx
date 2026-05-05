"use client";

import { FormEvent, useState } from "react";
import styles from "@/app/page.module.css";

export default function AdminAccountPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch("/api/auth/password/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        setError(payload?.error ?? "Failed to change password");
        return;
      }
      setMessage("Password updated. Please log in again.");
      setCurrentPassword("");
      setNewPassword("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>Account Security</h1>
        <p className={styles.adminSubtitle}>Change your dashboard password securely.</p>
      </header>
      <section className={styles.adminSection}>
        <form className={styles.adminForm} onSubmit={onSubmit}>
          <input
            type="password"
            className={styles.adminInput}
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <input
            type="password"
            className={styles.adminInput}
            placeholder="New password (min 8 chars)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            required
          />
          <button className={`${styles.adminButton} ${styles.adminButtonPrimary}`} disabled={busy}>
            {busy ? "Updating..." : "Change password"}
          </button>
        </form>
        {message ? <p className={styles.adminEmpty}>{message}</p> : null}
        {error ? <p className={styles.adminError}>{error}</p> : null}
      </section>
    </div>
  );
}
