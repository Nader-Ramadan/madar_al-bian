import type { Metadata } from "next";
import styles from "../page.module.css";
import NavBar from "../components/nav-bar";
import AllFieldsHeader from "@/app/components/all-fields-header";
import MagazinesGrid from "@/app/components/magazines-grid";
import CallToPublish from "@/app/components/call-to-publish";
import Footer from "../components/footer";

export const metadata: Metadata = {
  title: "All Magazines",
};

export default function Magazines() {
  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        <AllFieldsHeader />
        <MagazinesGrid />
        <CallToPublish />
        <Footer />
      </main>
    </div>
  );
}