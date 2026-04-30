import type { Metadata } from "next";
import styles from "../page.module.css";
import AboutUs from "../components/about-us";

export const metadata: Metadata = {
  title: "About Us",
};

export default function AboutUsPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <AboutUs />
      </main>
    </div>
  );
}
