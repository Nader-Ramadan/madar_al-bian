"use client";

import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";
import layout from "@/app/page.module.css";
import journalStyles from "@/app/magazine-journal.module.css";
import formStyles from "@/app/publication-form.module.css";
import staticStyles from "@/app/static-page.module.css";
import {
  IconFormIntro,
  IconResearcher,
  IconStudy,
  IconUpload,
} from "@/app/components/publication-form-icons";
import {
  ABSTRACT_MIN_WORDS_MESSAGE,
  countAbstractWords,
  meetsMinAbstractWords,
  MIN_ABSTRACT_WORDS,
} from "@/lib/publication-request-abstract";
import PhoneCountryField from "@/app/components/phone-country-field";
import { DEFAULT_PHONE_COUNTRY_ISO } from "@/lib/phone-countries";
import { isLikelyWordDocument, MAX_WORD_DOCUMENT_BYTES } from "@/lib/word-document";

const WORD_ACCEPT =
  ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type MagazineOption = { id: number; title: string };

export default function RequestPublicationPage() {
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [phoneCountry, setPhoneCountry] = useState(DEFAULT_PHONE_COUNTRY_ISO);
  const [phoneNational, setPhoneNational] = useState("");
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

  const abstractWordCount = countAbstractWords(abstract);
  const abstractMeetsMin = meetsMinAbstractWords(abstract);

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
    // #region agent log
    fetch("http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "51cdae" },
      body: JSON.stringify({
        sessionId: "51cdae",
        runId: "pre-fix",
        hypothesisId: "H3",
        location: "request-for-publication-of-a-study/page.tsx:onFileChange",
        message: "file input changed",
        data: {
          hasFile: !!file,
          fileName: file?.name ?? null,
          fileSize: file?.size ?? null,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const fileFromInput = fileInputRef.current?.files?.[0] ?? null;
    const fileToSend = wordFile ?? fileFromInput;

    if (!fileToSend) {
      setMessage({ type: "err", text: "يرجى إرفاق ملف الدراسة بصيغة Word." });
      return;
    }
    if (fileToSend.size === 0) {
      setMessage({
        type: "err",
        text: "تعذر قراءة الملف (حجمه 0). احفظ الملف على جهازك ثم أعد اختياره، أو انتظر حتى يكتمل تنزيله من OneDrive/iCloud.",
      });
      return;
    }
    if (!isLikelyWordDocument(fileToSend)) {
      setMessage({ type: "err", text: "يُسمح فقط بملفات Word (.doc أو .docx)." });
      return;
    }
    if (fileToSend.size > MAX_WORD_DOCUMENT_BYTES) {
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
      fd.append("authorPhoneCountry", phoneCountry);
      fd.append("authorPhoneNational", phoneNational);
      fd.append("title", title);
      fd.append("abstract", abstract);
      if (magazineId.trim() !== "") fd.append("magazineId", magazineId.trim());
      fd.append("file", fileToSend, fileToSend.name);

      // #region agent log
      fetch("http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "51cdae" },
        body: JSON.stringify({
          sessionId: "51cdae",
          runId: "pre-fix",
          hypothesisId: "H1",
          location: "request-for-publication-of-a-study/page.tsx:submit",
          message: "client submit with file",
          data: {
            fileName: fileToSend.name,
            fileSize: fileToSend.size,
            fileType: fileToSend.type,
            stateHadFile: !!wordFile,
            inputHadFile: !!fileFromInput,
            formHasFile: fd.has("file"),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion

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
      setPhoneCountry(DEFAULT_PHONE_COUNTRY_ISO);
      setPhoneNational("");
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
        <section className={journalStyles.shell}>
          <div className={journalStyles.inner}>
            <article
              className={`${journalStyles.card} ${journalStyles.cardSpanAll} ${formStyles.introCard}`}
            >
              <div className={journalStyles.cardHeader}>
                <div className={journalStyles.cardHeaderIcon}>
                  <IconFormIntro />
                </div>
                <h1 className={journalStyles.cardTitle}>طلب نشر دراسة</h1>
              </div>
              <div className={`${journalStyles.cardBody} ${formStyles.formCardBody}`}>
                <p className={formStyles.formIntroText}>
                  املأ النموذج أدناه وأرفق ملف الدراسة بصيغة Word فقط (.doc أو .docx). يجب أن يكون
                  الملخص {MIN_ABSTRACT_WORDS} كلمة على الأقل.
                </p>
              </div>
            </article>

            <form className={formStyles.form} onSubmit={submit} noValidate>
              <div className={formStyles.formGrid}>
                <article className={journalStyles.card}>
                  <div className={journalStyles.cardHeader}>
                    <div className={journalStyles.cardHeaderIcon}>
                      <IconResearcher />
                    </div>
                    <h2 className={journalStyles.cardTitle}>معلومات الباحث</h2>
                  </div>
                  <div className={`${journalStyles.cardBody} ${formStyles.formCardBody}`}>
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
                    <PhoneCountryField
                      idPrefix="pub-phone"
                      countryIso={phoneCountry}
                      nationalDigits={phoneNational}
                      onCountryChange={setPhoneCountry}
                      onNationalChange={setPhoneNational}
                    />
                  </div>
                </article>

                <article className={journalStyles.card}>
                  <div className={journalStyles.cardHeader}>
                    <div className={journalStyles.cardHeaderIcon}>
                      <IconStudy />
                    </div>
                    <h2 className={journalStyles.cardTitle}>تفاصيل الدراسة</h2>
                  </div>
                  <div className={`${journalStyles.cardBody} ${formStyles.formCardBody}`}>
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
                        <p className={`${staticStyles.hint} ${staticStyles.hintError}`}>
                          {magazinesError}
                        </p>
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
                        onChange={(ev) => {
                          setAbstract(ev.target.value);
                          setMessage(null);
                        }}
                        rows={8}
                        className={`${staticStyles.textarea} ${
                          abstract.trim() && !abstractMeetsMin ? staticStyles.textareaInvalid : ""
                        }`}
                        aria-invalid={abstract.trim().length > 0 && !abstractMeetsMin}
                        aria-describedby="pub-abstract-hint"
                      />
                      <p
                        id="pub-abstract-hint"
                        className={`${staticStyles.hint} ${staticStyles.wordCountHint} ${
                          abstractMeetsMin ? staticStyles.wordCountOk : staticStyles.wordCountLow
                        }`}
                      >
                        {abstractWordCount} / {MIN_ABSTRACT_WORDS} كلمة — الحد الأدنى{" "}
                        {MIN_ABSTRACT_WORDS} كلمة مطلوب للإرسال.
                        {abstractMeetsMin ? " ✓" : null}
                      </p>
                    </div>
                  </div>
                </article>

                <article className={`${journalStyles.card} ${journalStyles.cardSpanAll}`}>
                  <div className={journalStyles.cardHeader}>
                    <div className={journalStyles.cardHeaderIcon}>
                      <IconUpload />
                    </div>
                    <h2 className={journalStyles.cardTitle}>إرفاق الملف وإرسال</h2>
                  </div>
                  <div className={`${journalStyles.cardBody} ${formStyles.formCardBody}`}>
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
                    <div className={formStyles.submitRow}>
                      <button
                        type="submit"
                        disabled={loading || !abstractMeetsMin}
                        className={staticStyles.staticSubmit}
                      >
                        {loading ? "جاري الإرسال…" : "إرسال الطلب"}
                      </button>
                      {message ? (
                        <p
                          className={`${formStyles.formMessage} ${
                            message.type === "ok" ? staticStyles.messageOk : staticStyles.messageErr
                          }`}
                          role="status"
                        >
                          {message.text}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </article>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
