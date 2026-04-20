import type { Metadata } from "next";
import styles from "../page.module.css";
import NavBar from "../components/nav-bar";
import AdvisoryCommittee from "../components/advisory-committee";
import Footer from "../components/footer";

export const metadata: Metadata = {
  title: "Advisory Committee",
};

export default function AdvisoryCommitteePage() {
  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        <AdvisoryCommittee />
        <Footer />
      </main>
    </div>
  );
}