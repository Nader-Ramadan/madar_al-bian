"use client";

import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";
import layout from "@/app/page.module.css";
import staticStyles from "@/app/static-page.module.css";
import {
  ABSTRACT_MIN_WORDS_MESSAGE,
  meetsMinAbstractWords,
} from "@/lib/publication-request-abstract";
import { isLikelyWordDocument, MAX_WORD_DOCUMENT_BYTES } from "@/lib/word-document";

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
    if (!meetsMinAbstractWords(abstract)) {
      setMessage({ type: "err", text: ABSTRACT_MIN_WORDS_MESSAGE });
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
    <div className={layout.page}>
      <main className={layout.main}>
        <section className={staticStyles.shell}>
          <h1 className={staticStyles.title}>طلب نشر دراسة</h1>
          <p className={staticStyles.lead}>
            املأ النموذج أدناه وأرفق ملف الدراسة بصيغة Word فقط (.doc أو .docx). يجب أن يكون الملخص ٢٠٠
            كلمة على الأقل.
          </p>
          <form className={staticStyles.form} onSubmit={submit}>
            <div className={staticStyles.field}>
              <label className={staticStyles.label} htmlFor="pub-author">
                اسم المؤلف
              </label>
              <input
                id="pub-author"
                required
                value={authorName}
                onChange={(ev) => setAuthorName(ev.target.value)}
                type="text"
                className={staticStyles.input}
              />
            </div>
            <div className={staticStyles.field}>
              <label className={staticStyles.label} htmlFor="pub-email">
                البريد الإلكتروني
              </label>
              <input
                id="pub-email"
                required
                value={authorEmail}
                onChange={(ev) => setAuthorEmail(ev.target.value)}
                type="email"
                className={staticStyles.input}
              />
            </div>
            <div className={staticStyles.field}>
              <label className={staticStyles.label} htmlFor="pub-magazine">
                المجلة
              </label>
              <select
                id="pub-magazine"
                value={magazineId}
                onChange={(ev) => setMagazineId(ev.target.value)}
                className={staticStyles.select}
              >
                <option value="">— اختر المجلة (اختياري) —</option>
                {magazines.map((m) => (
                  <option key={m.id} value={String(m.id)}>
                    {m.title}
                  </option>
                ))}
              </select>
              {magazinesError ? (
                <p className={`${staticStyles.hint} ${staticStyles.hintError}`}>{magazinesError}</p>
              ) : null}
            </div>
            <div className={staticStyles.field}>
              <label className={staticStyles.label} htmlFor="pub-title">
                عنوان الدراسة
              </label>
              <input
                id="pub-title"
                required
                value={title}
                onChange={(ev) => setTitle(ev.target.value)}
                type="text"
                className={staticStyles.input}
              />
            </div>
            <div className={staticStyles.field}>
              <label className={staticStyles.label} htmlFor="pub-abstract">
                الملخص
              </label>
              <textarea
                id="pub-abstract"
                required
                value={abstract}
                onChange={(ev) => setAbstract(ev.target.value)}
                rows={6}
                className={staticStyles.textarea}
              />
            </div>
            <div className={staticStyles.field}>
              <label className={staticStyles.label} htmlFor="pub-file">
                ملف الدراسة (Word فقط)
              </label>
              <input
                key={fileInputKey}
                id="pub-file"
                ref={fileInputRef}
                required
                type="file"
                accept={WORD_ACCEPT}
                onChange={onFileChange}
                className={staticStyles.input}
              />
              <p className={staticStyles.hint}>
                الصيغ المسموحة: .doc و .docx فقط — الحد الأقصى 15 ميجابايت.
                {wordFile ? ` الملف المحدد: ${wordFile.name}` : null}
              </p>
            </div>
            <button type="submit" disabled={loading} className={staticStyles.staticSubmit}>
              {loading ? "جاري الإرسال…" : "إرسال الطلب"}
            </button>
          </form>
          {message ? (
            <p
              className={`${staticStyles.message} ${
                message.type === "ok" ? staticStyles.messageOk : staticStyles.messageErr
              }`}
            >
              {message.text}
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
}
