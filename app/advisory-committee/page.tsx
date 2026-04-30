import type { Metadata } from "next";
import styles from "../page.module.css";
import AdvisoryCommittee from "../components/advisory-committee";

export const metadata: Metadata = {
  title: "Advisory Committee",
};

export default function AdvisoryCommitteePage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <AdvisoryCommittee />
      </main>
    </div>
  );
}