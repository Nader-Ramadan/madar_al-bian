import type { Metadata } from "next";
import styles from "../page.module.css";
import NavBar from "../components/nav-bar";
import Conferences from "../components/conferences";
import Footer from "../components/footer";

export const metadata: Metadata = {
  title: "Conferences",
};

export default function ConferencesPage() {
  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        <Conferences />
        <Footer />
      </main>
    </div>
  );
}