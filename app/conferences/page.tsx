import type { Metadata } from "next";
import styles from "../page.module.css";
import Conferences from "../components/conferences";

export const metadata: Metadata = {
  title: "Conferences",
};

export default function ConferencesPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Conferences />
      </main>
    </div>
  );
}