"use client";

import journalStyles from "@/app/magazine-journal.module.css";
import formStyles from "@/app/publication-form.module.css";
import staticStyles from "@/app/static-page.module.css";
import PayPalResearchCheckout from "@/app/components/paypal-research-checkout";
import type { PublicationRequestSummary } from "@/lib/publication-payment";

type Props = {
  summary: PublicationRequestSummary;
  paypalClientId: string;
  onPaid: (summary: PublicationRequestSummary) => void;
};

export default function PublicationPaymentStep({ summary, paypalClientId, onPaid }: Props) {
  const fee = summary.fee;

  return (
    <article className={`${journalStyles.card} ${journalStyles.cardSpanAll}`}>
      <div className={journalStyles.cardHeader}>
        <h2 className={journalStyles.cardTitle}>إتمام الدفع</h2>
      </div>
      <div className={`${journalStyles.cardBody} ${formStyles.formCardBody}`}>
        <p className={formStyles.formIntroText}>
          تم استلام دراستك. لإكمال الطلب، يرجى دفع رسوم نشر الدراسة عبر PayPal.
        </p>
        <dl className={formStyles.summaryList}>
          <div>
            <dt>رقم الطلب</dt>
            <dd>#{summary.id}</dd>
          </div>
          <div>
            <dt>عنوان الدراسة</dt>
            <dd>{summary.title}</dd>
          </div>
          <div>
            <dt>المؤلف</dt>
            <dd>{summary.authorName}</dd>
          </div>
          {summary.magazineTitle ? (
            <div>
              <dt>المجلة</dt>
              <dd>{summary.magazineTitle}</dd>
            </div>
          ) : null}
          {fee ? (
            <div>
              <dt>رسوم النشر</dt>
              <dd>
                <strong>
                  {fee.amount} {fee.currency}
                </strong>
              </dd>
            </div>
          ) : null}
        </dl>
        <PayPalResearchCheckout summary={summary} clientId={paypalClientId} onPaid={onPaid} />
        <p className={staticStyles.hint}>
          احفظ رابط هذه الصفحة إذا احتجت لإكمال الدفع لاحقاً.
        </p>
      </div>
    </article>
  );
}
