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
          <p className={staticStyles.prose}>
            يتم تحديث هذه الصفحة. للاستفسارات العاجلة يرجى{" "}
            <Link href="/contact-us">الاتصال بنا</Link>.
          </p>
        </section>
      </main>
    </div>
  );
}
