import type { Metadata } from "next";
import styles from "../page.module.css";
import AllFieldsHeader from "@/app/components/all-fields-header";
import MagazinesGrid from "@/app/components/magazines-grid";
import CallToPublish from "@/app/components/call-to-publish";

export const metadata: Metadata = {
  title: "All Magazines",
};

export default function Magazines() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <AllFieldsHeader />
        <MagazinesGrid />
        <CallToPublish />
      </main>
    </div>
  );
}