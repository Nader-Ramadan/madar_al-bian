import type { Metadata } from "next";
import Link from "next/link";
import { DebugBeacon } from "../components/debug-beacon";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
};

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <DebugBeacon
        location="app/privacy/page.tsx"
        hypothesisId="H2"
        message="legal_page_mount"
        data={{ route: "privacy" }}
      />
      <main className={styles.main}>
        <section
          style={{
            padding: "4rem 2rem",
            maxWidth: "800px",
            margin: "0 auto",
            textAlign: "right",
            direction: "rtl",
          }}
        >
          <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "1rem" }}>سياسة الخصوصية</h1>
          <p style={{ lineHeight: 1.8, color: "var(--text-muted)" }}>
            يتم تحديث هذه الصفحة. للاستفسارات العاجلة يرجى{" "}
            <Link href="/contact-us" style={{ color: "var(--primary-color)" }}>
              الاتصال بنا
            </Link>
            .
          </p>
        </section>
      </main>
    </div>
  );
}
