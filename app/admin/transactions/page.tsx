"use client";

import { FormEvent, useEffect, useState } from "react";
import styles from "@/app/page.module.css";
import { adminCopy } from "@/lib/admin/ar-copy";
import { translateAdminApiMessage } from "@/lib/admin/api-error-ar";

type Transaction = {
  id: number;
  status: string;
  amount: string;
  currency: string;
  payerEmail: string | null;
  paypalCaptureId: string | null;
  paypalRefundId: string | null;
  refundError: string | null;
  createdAt: string;
  publicationRequest: {
    id: number;
    title: string;
    authorName: string;
    authorEmail: string;
    status: string;
  } | null;
};

export default function AdminTransactionsPage() {
  const tp = adminCopy.transactionsPage;
  const [items, setItems] = useState<Transaction[]>([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [emailFor, setEmailFor] = useState<Transaction | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [error, setError] = useState("");

  const refresh = async () => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (search.trim()) params.set("search", search.trim());
    const res = await fetch(`/api/admin/transactions?${params.toString()}`);
    const payload = await res.json();
    setItems(payload?.data?.items ?? []);
  };

  useEffect(() => {
    refresh();
  }, []);

  const applyFilters = async (e: FormEvent) => {
    e.preventDefault();
    await refresh();
  };

  const openEmail = (tx: Transaction) => {
    setEmailFor(tx);
    setEmailSubject(`بخصوص طلب نشر: ${tx.publicationRequest?.title ?? ""}`);
    setEmailBody(
      `مرحباً ${tx.publicationRequest?.authorName ?? ""},\n\n`,
    );
    setError("");
  };

  const sendEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!emailFor) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/transactions/${emailFor.id}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: emailSubject, body: emailBody }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        setError(translateAdminApiMessage(payload.error ?? "فشل الإرسال"));
        return;
      }
      setEmailFor(null);
    } finally {
      setBusy(false);
    }
  };

  const retryRefund = async (tx: Transaction) => {
    if (!confirm("إعادة محاولة الاسترداد؟")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/transactions/${tx.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retry-refund" }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        alert(translateAdminApiMessage(payload.error ?? "فشل الاسترداد"));
        return;
      }
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>{tp.title}</h1>
        <p className={styles.adminSectionExplainer}>{tp.explainer}</p>
      </header>

      <section className={styles.adminSection}>
        <form onSubmit={applyFilters} className={styles.adminForm}>
          <select
            className={styles.adminInput}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">{tp.filterAll}</option>
            <option value="PENDING">{tp.statusPending}</option>
            <option value="COMPLETED">{tp.statusCompleted}</option>
            <option value="FAILED">{tp.statusFailed}</option>
            <option value="REFUNDED">{tp.statusRefunded}</option>
            <option value="CANCELLED">{tp.statusCancelled}</option>
          </select>
          <input
            className={styles.adminInput}
            placeholder={tp.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className={styles.adminButton}>
            تطبيق
          </button>
        </form>
      </section>

      <section className={styles.adminSection}>
        {items.length === 0 ? (
          <p className={styles.adminEmpty}>{tp.empty}</p>
        ) : (
          <ul className={styles.adminList}>
            {items.map((tx) => (
              <li key={tx.id} className={styles.adminListItem}>
                <span className={styles.adminListText}>
                  <strong>
                    {tx.amount} {tx.currency}
                  </strong>{" "}
                  — {tx.status}
                  <br />
                  {tp.colDate}{" "}
                  {new Intl.DateTimeFormat("ar-EG", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(tx.createdAt))}
                  <br />
                  {tx.publicationRequest ? (
                    <>
                      {tp.colStudy} {tx.publicationRequest.title} (#{tx.publicationRequest.id})
                      <br />
                      {tp.colAuthor} {tx.publicationRequest.authorName} ({tx.publicationRequest.authorEmail})
                      <br />
                      حالة الطلب: {tx.publicationRequest.status}
                      <br />
                    </>
                  ) : null}
                  {tx.paypalCaptureId ? <>Capture: {tx.paypalCaptureId}<br /></> : null}
                  {tx.paypalRefundId ? <>Refund: {tx.paypalRefundId}<br /></> : null}
                  {tx.refundError ? (
                    <>
                      {tp.refundError} {tx.refundError}
                      <br />
                    </>
                  ) : null}
                </span>
                <div className={styles.adminActions}>
                  <button
                    type="button"
                    className={styles.adminButton}
                    disabled={busy}
                    onClick={() => openEmail(tx)}
                  >
                    {tp.sendEmail}
                  </button>
                  {tx.publicationRequest?.status === "REJECTED" &&
                  tx.status === "COMPLETED" &&
                  tx.refundError ? (
                    <button
                      type="button"
                      className={`${styles.adminButton} ${styles.adminButtonDanger}`}
                      disabled={busy}
                      onClick={() => retryRefund(tx)}
                    >
                      {tp.retryRefund}
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {emailFor ? (
        <section className={styles.adminSection}>
          <form onSubmit={sendEmail} className={styles.adminForm}>
            <input
              className={styles.adminInput}
              placeholder={tp.emailSubject}
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              required
            />
            <textarea
              className={styles.adminTextarea}
              placeholder={tp.emailBody}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              required
            />
            <div className={styles.adminActions}>
              <button
                type="submit"
                className={`${styles.adminButton} ${styles.adminButtonPrimary}`}
                disabled={busy}
              >
                {busy ? tp.emailSending : tp.emailSend}
              </button>
              <button
                type="button"
                className={styles.adminButton}
                onClick={() => setEmailFor(null)}
              >
                إلغاء
              </button>
            </div>
          </form>
          {error ? <p className={styles.adminError}>{error}</p> : null}
        </section>
      ) : null}
    </div>
  );
}
