"use client";

import { type ChangeEvent, type CSSProperties, type FormEvent, useEffect, useRef, useState } from "react";
import styles from "@/app/page.module.css";
import { isLikelyWordDocument, MAX_WORD_DOCUMENT_BYTES } from "@/lib/word-document";

const rtlSection = {
  padding: "4rem 2rem",
  maxWidth: "800px",
  margin: "0 auto",
  textAlign: "right" as const,
  direction: "rtl" as const,
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "0.75rem",
  border: "1px solid var(--border-light)",
  borderRadius: "0.5rem",
  background: "var(--card-bg)",
  color: "var(--text-primary)",
};

const WORD_ACCEPT =
  ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type MagazineOption = { id: number; title: string };

export default function RequestPublicationPage() {
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [magazineId, setMagazineId] = useState("");
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [wordFile, setWordFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [magazines, setMagazines] = useState<MagazineOption[]>([]);
  const [magazinesError, setMagazinesError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/magazines?limit=100");
        const payload = await res.json().catch(() => null);
        if (!res.ok || !payload?.success) {
          if (!cancelled) setMagazinesError("تعذر تحميل قائمة المجلات");
          return;
        }
        const items = (payload.data?.items ?? []) as { id: number; title: string }[];
        if (!cancelled) {
          setMagazines(items.map((m) => ({ id: m.id, title: m.title })));
          setMagazinesError(null);
        }
      } catch {
        if (!cancelled) setMagazinesError("تعذر تحميل قائمة المجلات");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onFileChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0] ?? null;
    setWordFile(file);
    setMessage(null);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!wordFile) {
      setMessage({ type: "err", text: "يرجى إرفاق ملف الدراسة بصيغة Word." });
      return;
    }
    if (!isLikelyWordDocument(wordFile)) {
      setMessage({ type: "err", text: "يُسمح فقط بملفات Word (.doc أو .docx)." });
      return;
    }
    if (wordFile.size > MAX_WORD_DOCUMENT_BYTES) {
      setMessage({ type: "err", text: "حجم الملف كبير جداً (الحد الأقصى 15 ميجابايت)." });
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("authorName", authorName);
      fd.append("authorEmail", authorEmail);
      fd.append("title", title);
      fd.append("abstract", abstract);
      if (magazineId.trim() !== "") fd.append("magazineId", magazineId.trim());
      fd.append("file", wordFile);

      const response = await fetch("/api/publication-requests", {
        method: "POST",
        body: fd,
      });
      const payload = await response.json().catch(() => ({ parseError: true }));
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
      setMagazineId("");
      setTitle("");
      setAbstract("");
      setWordFile(null);
      setFileInputKey((k) => k + 1);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
            املأ النموذج أدناه وأرفق ملف الدراسة بصيغة Word فقط (.doc أو .docx). يجب أن يكون الملخص ٢٠
            حرفاً على الأقل.
          </p>
          <form style={{ display: "grid", gap: "1.25rem" }} onSubmit={submit}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>اسم المؤلف</label>
              <input
                required
                value={authorName}
                onChange={(ev) => setAuthorName(ev.target.value)}
                type="text"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>البريد الإلكتروني</label>
              <input
                required
                value={authorEmail}
                onChange={(ev) => setAuthorEmail(ev.target.value)}
                type="email"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>المجلة</label>
              <select
                value={magazineId}
                onChange={(ev) => setMagazineId(ev.target.value)}
                style={inputStyle}
              >
                <option value="">— اختر المجلة (اختياري) —</option>
                {magazines.map((m) => (
                  <option key={m.id} value={String(m.id)}>
                    {m.title}
                  </option>
                ))}
              </select>
              {magazinesError ? (
                <p style={{ marginTop: "0.35rem", fontSize: "0.85rem", color: "crimson" }}>{magazinesError}</p>
              ) : null}
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>عنوان الدراسة</label>
              <input
                required
                value={title}
                onChange={(ev) => setTitle(ev.target.value)}
                type="text"
                style={inputStyle}
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
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                ملف الدراسة (Word فقط)
              </label>
              <input
                key={fileInputKey}
                ref={fileInputRef}
                required
                type="file"
                accept={WORD_ACCEPT}
                onChange={onFileChange}
                style={inputStyle}
              />
              <p style={{ marginTop: "0.35rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                الصيغ المسموحة: .doc و .docx فقط — الحد الأقصى 15 ميجابايت.
                {wordFile ? ` الملف المحدد: ${wordFile.name}` : null}
              </p>
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
