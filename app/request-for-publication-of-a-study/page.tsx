import type { Metadata } from "next";
import styles from "../page.module.css";
import RequestForPublication from "../components/request-for-publication";

export const metadata: Metadata = {
  title: "Request for Publication of a Study",
};

export default function RequestForPublicationPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <RequestForPublication />
      </main>
    </div>
  );
}