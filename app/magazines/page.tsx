import type { Metadata } from "next";
import styles from "../page.module.css";
import AllFieldsHeader from "@/app/components/all-fields-header";
import MagazinesGrid from "@/app/components/magazines-grid";
import CallToPublish from "@/app/components/call-to-publish";
import { loadMagazineCardsForPage } from "@/lib/load-magazines-page";

export const metadata: Metadata = {
  title: "All Magazines",
};

/** Always load from DB on the server so the browser never depends on fetch("/api/magazines"). */
export const dynamic = "force-dynamic";

export default async function Magazines() {
  const { items, error } = await loadMagazineCardsForPage(100);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <AllFieldsHeader />
        <MagazinesGrid initialItems={items} initialError={error} />
        <CallToPublish />
      </main>
    </div>
  );
}
