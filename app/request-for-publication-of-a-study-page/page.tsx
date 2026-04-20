import type { Metadata } from "next";
import styles from "../page.module.css";
import NavBar from "../components/nav-bar";
import RequestForPublication from "../components/request-for-publication";
import Footer from "../components/footer";

export const metadata: Metadata = {
  title: "Request for Publication of a Study",
};

export default function RequestForPublicationPage() {
  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        <RequestForPublication />
        <Footer />
      </main>
    </div>
  );
}