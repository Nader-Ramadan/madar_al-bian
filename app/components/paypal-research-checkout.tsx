"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useState } from "react";
import staticStyles from "@/app/static-page.module.css";
import formStyles from "@/app/publication-form.module.css";
import type { PublicationRequestSummary } from "@/lib/publication-payment";

type Props = {
  summary: PublicationRequestSummary;
  clientId: string;
  onPaid: (summary: PublicationRequestSummary) => void;
};

export default function PayPalResearchCheckout({ summary, clientId, onPaid }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!summary.paymentAccessToken) {
    return <p className={staticStyles.messageErr}>رمز الدفع غير متوفر.</p>;
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: summary.fee?.currency ?? "USD",
        intent: "capture",
      }}
    >
      <div className={formStyles.paypalWrap}>
        {busy ? <p className={staticStyles.hint}>جاري معالجة الدفع…</p> : null}
        {error ? (
          <p className={`${formStyles.formMessage} ${staticStyles.messageErr}`} role="alert">
            {error}
          </p>
        ) : null}
        <PayPalButtons
          style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal" }}
          disabled={busy}
          createOrder={async () => {
            setError(null);
            setBusy(true);
            try {
              const res = await fetch("/api/payments/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  publicationRequestId: summary.id,
                  paymentAccessToken: summary.paymentAccessToken,
                }),
              });
              const payload = await res.json();
              if (!payload.success) {
                throw new Error(payload.error ?? "تعذر إنشاء طلب الدفع");
              }
              return payload.data.orderId as string;
            } catch (e) {
              const msg = e instanceof Error ? e.message : "تعذر إنشاء طلب الدفع";
              setError(msg);
              throw e;
            } finally {
              setBusy(false);
            }
          }}
          onApprove={async (data) => {
            setError(null);
            setBusy(true);
            try {
              const res = await fetch("/api/payments/capture", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: data.orderID,
                  publicationRequestId: summary.id,
                  paymentAccessToken: summary.paymentAccessToken,
                }),
              });
              const payload = await res.json();
              if (!payload.success) {
                throw new Error(payload.error ?? "تعذر إتمام الدفع");
              }
              onPaid(payload.data.summary as PublicationRequestSummary);
            } catch (e) {
              setError(e instanceof Error ? e.message : "تعذر إتمام الدفع");
            } finally {
              setBusy(false);
            }
          }}
          onError={() => setError("حدث خطأ أثناء الدفع عبر PayPal.")}
        />
      </div>
    </PayPalScriptProvider>
  );
}
