import type { Metadata } from "next";
import Link from "next/link";
import layout from "../page.module.css";
import staticStyles from "../static-page.module.css";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
};

export default function PrivacyPage() {
  return (
    <div className={layout.page}>
      <main className={layout.main}>
        <section className={staticStyles.shell}>
          <h1 className={staticStyles.title}>سياسة الخصوصية</h1>
          <div className={staticStyles.prose}>
            <h2>بيانات الدفع</h2>
            <p>
              تتم معالجة مدفوعات رسوم النشر عبر PayPal. لا نخزّن بيانات بطاقات الائتمان على
              خوادمنا؛ نحتفظ بمعرّفات المعاملات والمبلغ والبريد الإلكتروني للمُدفع لأغراض
              المراجعة والاسترداد.
            </p>
            <h2>التواصل</h2>
            <p>
              للاستفسارات العاجلة يرجى{" "}
              <Link href="/contact-us">الاتصال بنا</Link>.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
