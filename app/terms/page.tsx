import type { Metadata } from "next";
import Link from "next/link";
import layout from "../page.module.css";
import staticStyles from "../static-page.module.css";

export const metadata: Metadata = {
  title: "الشروط والأحكام",
};

export default function TermsPage() {
  return (
    <div className={layout.page}>
      <main className={layout.main}>
        <section className={staticStyles.shell}>
          <h1 className={staticStyles.title}>الشروط والأحكام</h1>
          <div className={staticStyles.prose}>
            <h2>رسوم نشر الدراسة</h2>
            <p>
              قد تُفرض رسوم على نشر الدراسة عبر الموقع. يتم تحديد المبلغ من إعدادات المنصة
              ويُدفع عبر PayPal بعد إرسال ملف الدراسة.
            </p>
            <h2>الاسترداد</h2>
            <p>
              عند رفض طلب نشر مدفوع من قبل فريق التحرير، يُصدر استرداد كامل للمبلغ تلقائياً
              إلى حساب المؤلف عبر PayPal. قد يستغرق ظهور المبلغ في الحساب عدة أيام عمل.
            </p>
            <h2>التواصل</h2>
            <p>
              للاستفسارات العاجلة أو مشكلات الدفع يرجى{" "}
              <Link href="/contact-us">الاتصال بنا</Link>.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
