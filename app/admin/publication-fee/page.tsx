"use client";

import { FormEvent, useEffect, useState } from "react";
import styles from "@/app/page.module.css";
import { adminCopy } from "@/lib/admin/ar-copy";
import { translateAdminApiMessage } from "@/lib/admin/api-error-ar";

type FeeForm = {
  amount: string;
  currency: "USD" | "EUR" | "SAR" | "EGP";
  enabled: boolean;
  labelAr: string;
  labelEn: string;
};

export default function AdminPublicationFeePage() {
  const fp = adminCopy.publicationFeePage;
  const [form, setForm] = useState<FeeForm>({
    amount: "0",
    currency: "USD",
    enabled: false,
    labelAr: "",
    labelEn: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/publication-fee");
      const payload = await res.json();
      if (payload?.success && payload.data) {
        setForm({
          amount: String(payload.data.amount ?? "0"),
          currency: payload.data.currency ?? "USD",
          enabled: Boolean(payload.data.enabled),
          labelAr: payload.data.labelAr ?? "",
          labelEn: payload.data.labelEn ?? "",
        });
      }
    })();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/publication-fee", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(form.amount),
          currency: form.currency,
          enabled: form.enabled,
          labelAr: form.labelAr.trim() || null,
          labelEn: form.labelEn.trim() || null,
        }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        setError(translateAdminApiMessage(payload.error ?? "فشل الحفظ"));
        return;
      }
      setMessage(fp.saved);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>{fp.title}</h1>
        <p className={styles.adminSectionExplainer}>{fp.explainer}</p>
      </header>
      <section className={styles.adminSection}>
        <form onSubmit={onSubmit} className={styles.adminForm}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm((s) => ({ ...s, enabled: e.target.checked }))}
            />
            {fp.enabledLabel}
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            className={styles.adminInput}
            placeholder={fp.amountLabel}
            value={form.amount}
            onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))}
            required
          />
          <select
            className={styles.adminInput}
            value={form.currency}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                currency: e.target.value as FeeForm["currency"],
              }))
            }
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="SAR">SAR</option>
            <option value="EGP">EGP</option>
          </select>
          <input
            className={styles.adminInput}
            placeholder={fp.labelAr}
            value={form.labelAr}
            onChange={(e) => setForm((s) => ({ ...s, labelAr: e.target.value }))}
          />
          <input
            className={styles.adminInput}
            placeholder={fp.labelEn}
            value={form.labelEn}
            onChange={(e) => setForm((s) => ({ ...s, labelEn: e.target.value }))}
          />
          <button
            type="submit"
            className={`${styles.adminButton} ${styles.adminButtonPrimary}`}
            disabled={busy}
          >
            {busy ? fp.saving : fp.save}
          </button>
        </form>
        {message ? <p className={styles.adminSectionExplainer}>{message}</p> : null}
        {error ? <p className={styles.adminError}>{error}</p> : null}
      </section>
    </div>
  );
}
