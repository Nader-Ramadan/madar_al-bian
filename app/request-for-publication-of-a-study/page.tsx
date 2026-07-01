"use client";

import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import PublicationPaymentStep from "@/app/components/publication-payment-step";
import PublicationConfirmationStep from "@/app/components/publication-confirmation-step";
import {
  ABSTRACT_MAX_WORDS_MESSAGE,
  countAbstractWords,
  withinAbstractWordLimit,
  MAX_ABSTRACT_WORDS,
} from "@/lib/publication-request-abstract";
import PhoneCountryField from "@/app/components/phone-country-field";
import { DEFAULT_PHONE_COUNTRY_ISO } from "@/lib/phone-countries";
import { isLikelyWordDocument, MAX_WORD_DOCUMENT_BYTES } from "@/lib/word-document";
import type { PublicationRequestSummary } from "@/lib/publication-payment";

const WORD_ACCEPT =
  ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type MagazineOption = { id: number; title: string };
type WizardStep = "submit" | "payment" | "confirmation";

export default function RequestPublicationPage() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<WizardStep>("submit");
  const [summary, setSummary] = useState<PublicationRequestSummary | null>(null);
  const [paypalClientId, setPaypalClientId] = useState<string | null>(null);
  const [feeNotice, setFeeNotice] = useState<string | null>(null);

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
  const abstractWithinLimit = withinAbstractWordLimit(abstract);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [magRes, feeRes, payRes] = await Promise.all([
          fetch("/api/magazines?limit=100"),
          fetch("/api/publication-fee"),
          fetch("/api/payments/config"),
        ]);
        const magPayload = await magRes.json().catch(() => null);
        if (!magRes.ok || !magPayload?.success) {
          if (!cancelled) setMagazinesError("تعذر تحميل قائمة المجلات");
        } else {
          const items = (magPayload.data?.items ?? []) as { id: number; title: string }[];
          if (!cancelled) {
            setMagazines(items.map((m) => ({ id: m.id, title: m.title })));
            setMagazinesError(null);
          }
        }

        const feePayload = await feeRes.json().catch(() => null);
        if (!cancelled && feePayload?.success && feePayload.data?.enabled) {
          setFeeNotice(
            `بعد إرسال الدراسة ستُطلب رسوم النشر: ${feePayload.data.label ?? `${feePayload.data.amount} ${feePayload.data.currency}`}`,
          );
        }

        const payPayload = await payRes.json().catch(() => null);
        if (!cancelled && payPayload?.success && payPayload.data?.clientId) {
          setPaypalClientId(payPayload.data.clientId as string);
        }
      } catch {
        if (!cancelled) setMagazinesError("تعذر تحميل قائمة المجلات");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const token = searchParams.get("token")?.trim();
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/publication-requests/payment-status?token=${encodeURIComponent(token)}`,
        );
        const payload = await res.json();
        if (!payload.success || cancelled) return;
        const s = payload.data.summary as PublicationRequestSummary;
        setSummary(s);
        if (payload.data.needsPayment) setStep("payment");
        else setStep("confirmation");
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const resetWizard = () => {
    setStep("submit");
    setSummary(null);
    setMessage(null);
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
  };

  const onFileChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0] ?? null;
    setWordFile(file);
    setMessage(null);
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
    if (!withinAbstractWordLimit(abstract)) {
      setMessage({ type: "err", text: ABSTRACT_MAX_WORDS_MESSAGE });
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

      const data = (payload as { data: { summary: PublicationRequestSummary; needsPayment: boolean } })
        .data;
      setSummary(data.summary);
      if (data.needsPayment) {
        setStep("payment");
      } else {
        setStep("confirmation");
      }
    } catch {
      setMessage({ type: "err", text: "حدث خطأ أثناء الإرسال." });
    } finally {
      setLoading(false);
    }
  };

  const stepLabel =
    step === "submit" ? "الخطوة ١ من ٣: إرسال الدراسة" : step === "payment" ? "الخطوة ٢ من ٣: الدفع" : "الخطوة ٣ من ٣: التأكيد";

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
                <p className={formStyles.stepIndicator}>{stepLabel}</p>
                {step === "submit" ? (
                  <>
                    <p className={formStyles.formIntroText}>
                      املأ النموذج أدناه وأرفق ملف الدراسة بصيغة Word فقط (.doc أو .docx). يجب ألا
                      يتجاوز الملخص {MAX_ABSTRACT_WORDS} كلمة.
                    </p>
                    {feeNotice ? <p className={formStyles.feeNotice}>{feeNotice}</p> : null}
                  </>
                ) : null}
              </div>
            </article>

            {step === "submit" ? (
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
                            abstract.trim() && !abstractWithinLimit
                              ? staticStyles.textareaInvalid
                              : ""
                          }`}
                          aria-invalid={abstract.trim().length > 0 && !abstractWithinLimit}
                          aria-describedby="pub-abstract-hint"
                        />
                        <p
                          id="pub-abstract-hint"
                          className={`${staticStyles.hint} ${staticStyles.wordCountHint} ${
                            abstractWithinLimit ? staticStyles.wordCountOk : staticStyles.wordCountLow
                          }`}
                        >
                          {abstractWordCount} / {MAX_ABSTRACT_WORDS} كلمة — الحد الأقصى{" "}
                          {MAX_ABSTRACT_WORDS} كلمة.
                          {abstract.trim() && abstractWithinLimit ? " ✓" : null}
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
                          disabled={loading || !abstractWithinLimit}
                          className={staticStyles.staticSubmit}
                        >
                          {loading ? "جاري الإرسال…" : "إرسال الدراسة"}
                        </button>
                        {message ? (
                          <p
                            className={`${formStyles.formMessage} ${
                              message.type === "ok"
                                ? staticStyles.messageOk
                                : staticStyles.messageErr
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
            ) : null}

            {step === "payment" && summary && paypalClientId ? (
              <PublicationPaymentStep
                summary={summary}
                paypalClientId={paypalClientId}
                onPaid={(s) => {
                  setSummary(s);
                  setStep("confirmation");
                }}
              />
            ) : null}

            {step === "payment" && summary && !paypalClientId ? (
              <p className={staticStyles.messageErr}>
                إعدادات PayPal غير متوفرة. تواصل مع إدارة الموقع.
              </p>
            ) : null}

            {step === "confirmation" && summary ? (
              <PublicationConfirmationStep summary={summary} onNewRequest={resetWizard} />
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
