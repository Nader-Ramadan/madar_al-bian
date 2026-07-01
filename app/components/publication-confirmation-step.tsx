"use client";

import Link from "next/link";
import journalStyles from "@/app/magazine-journal.module.css";
import formStyles from "@/app/publication-form.module.css";
import staticStyles from "@/app/static-page.module.css";
import type { PublicationRequestSummary } from "@/lib/publication-payment";

type Props = {
  summary: PublicationRequestSummary;
  onNewRequest: () => void;
};

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

export default function PublicationConfirmationStep({ summary, onNewRequest }: Props) {
  const paid = summary.payment?.status === "COMPLETED";

  return (
    <article className={`${journalStyles.card} ${journalStyles.cardSpanAll} ${formStyles.confirmCard}`}>
      <div className={journalStyles.cardHeader}>
        <h2 className={journalStyles.cardTitle}>
          {paid || !summary.fee?.enabled ? "تم استلام طلبك" : "حالة الطلب"}
        </h2>
      </div>
      <div className={`${journalStyles.cardBody} ${formStyles.formCardBody}`}>
        <p
          className={`${formStyles.formMessage} ${staticStyles.messageOk}`}
          role="status"
        >
          {paid || !summary.fee?.enabled
            ? "شكراً لك. تم تسجيل طلب نشر دراستك وسيتم مراجعته من قبل فريق التحرير."
            : "تم حفظ الدراسة. أكمل الدفع لإرسال الطلب للمراجعة."}
        </p>

        <dl className={formStyles.summaryList}>
          <div>
            <dt>رقم الطلب</dt>
            <dd>#{summary.id}</dd>
          </div>
          <div>
            <dt>تاريخ الإرسال</dt>
            <dd>{formatDate(summary.createdAt)}</dd>
          </div>
          <div>
            <dt>عنوان الدراسة</dt>
            <dd>{summary.title}</dd>
          </div>
          <div>
            <dt>المؤلف</dt>
            <dd>{summary.authorName}</dd>
          </div>
          <div>
            <dt>البريد الإلكتروني</dt>
            <dd>{summary.authorEmail}</dd>
          </div>
          {summary.magazineTitle ? (
            <div>
              <dt>المجلة</dt>
              <dd>{summary.magazineTitle}</dd>
            </div>
          ) : null}
          {summary.payment ? (
            <>
              <div>
                <dt>حالة الدفع</dt>
                <dd>{summary.payment.status}</dd>
              </div>
              <div>
                <dt>المبلغ</dt>
                <dd>
                  {summary.payment.amount} {summary.payment.currency}
                </dd>
              </div>
              {summary.payment.paypalCaptureId ? (
                <div>
                  <dt>معرّف PayPal</dt>
                  <dd>{summary.payment.paypalCaptureId}</dd>
                </div>
              ) : null}
            </>
          ) : null}
        </dl>

        <div className={formStyles.submitRow}>
          <button type="button" className={staticStyles.staticSubmit} onClick={onNewRequest}>
            إرسال طلب جديد
          </button>
          <Link href="/" className={staticStyles.hint}>
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </article>
  );
}
