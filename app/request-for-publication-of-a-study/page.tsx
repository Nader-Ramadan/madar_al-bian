"use client";

import { FormEvent, useState } from "react";
import { logDebugClient } from "@/app/components/debug-beacon";
import styles from "@/app/page.module.css";

const rtlSection = {
  padding: "4rem 2rem",
  maxWidth: "800px",
  margin: "0 auto",
  textAlign: "right" as const,
  direction: "rtl" as const,
};

export default function RequestPublicationPage() {
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [field, setField] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const body = {
        authorName,
        authorEmail,
        title,
        abstract,
        field: field.trim() || null,
      };
      const response = await fetch("/api/publication-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json().catch(() => ({ parseError: true }));
      logDebugClient({
        location: "app/request-for-publication-of-a-study/page.tsx",
        hypothesisId: "H5",
        message: "publication_request_response",
        data: {
          httpStatus: response.status,
          success: (payload as { success?: boolean }).success,
          error: (payload as { error?: string }).error,
          parseError: Boolean((payload as { parseError?: boolean }).parseError),
        },
      });
      if (!(payload as { success?: boolean }).success) {
        setMessage({
          type: "err",
          text: (payload as { error?: string }).error || "تعذر إرسال الطلب",
        });
        return;
      }
      setMessage({ type: "ok", text: "تم استلام طلبك بنجاح." });
      setAuthorName("");
      setAuthorEmail("");
      setTitle("");
      setAbstract("");
      setField("");
    } catch {
      setMessage({ type: "err", text: "حدث خطأ أثناء الإرسال." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section style={rtlSection}>
          <h1
            style={{
              fontSize: "2.25rem",
              fontWeight: 900,
              color: "var(--secondary-color)",
              marginBottom: "1rem",
            }}
          >
            طلب نشر دراسة
          </h1>
          <p style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "var(--text-muted)", marginBottom: "2rem" }}>
            املأ النموذج أدناه. يجب أن يكون الملخص ٢٠ حرفاً على الأقل كما هو مطلوب في النظام.
          </p>
          <form style={{ display: "grid", gap: "1.25rem" }} onSubmit={submit}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>اسم المؤلف</label>
              <input
                required
                value={authorName}
                onChange={(ev) => setAuthorName(ev.target.value)}
                type="text"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid var(--border-light)",
                  borderRadius: "0.5rem",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>البريد الإلكتروني</label>
              <input
                required
                value={authorEmail}
                onChange={(ev) => setAuthorEmail(ev.target.value)}
                type="email"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid var(--border-light)",
                  borderRadius: "0.5rem",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>عنوان الدراسة</label>
              <input
                required
                value={title}
                onChange={(ev) => setTitle(ev.target.value)}
                type="text"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid var(--border-light)",
                  borderRadius: "0.5rem",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>الملخص</label>
              <textarea
                required
                minLength={20}
                value={abstract}
                onChange={(ev) => setAbstract(ev.target.value)}
                rows={6}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid var(--border-light)",
                  borderRadius: "0.5rem",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                المجال (اختياري)
              </label>
              <input
                value={field}
                onChange={(ev) => setField(ev.target.value)}
                type="text"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid var(--border-light)",
                  borderRadius: "0.5rem",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: "var(--primary-color)",
                color: "var(--secondary-color)",
                padding: "1rem 2rem",
                border: "none",
                borderRadius: "0.5rem",
                fontWeight: "bold",
                cursor: loading ? "wait" : "pointer",
              }}
            >
              {loading ? "جاري الإرسال…" : "إرسال الطلب"}
            </button>
          </form>
          {message ? (
            <p
              style={{
                marginTop: "1.25rem",
                color: message.type === "ok" ? "green" : "crimson",
                fontWeight: 600,
              }}
            >
              {message.text}
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
}
