import { Suspense } from "react";
import MagazineResearchEditor from "@/app/admin/components/magazine-research-editor";
import styles from "@/app/page.module.css";

function ResearchesEditorFallback() {
  return (
    <p className={styles.adminSubtitle} aria-busy="true">
      Loading editor…
    </p>
  );
}

export default function AdminMagazineResearchesPage() {
  return (
    <div className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>Magazine researches</h1>
        <p className={styles.adminSubtitle}>
          Edit researcher names, titles, external links, summaries, and sort order for each magazine version.
        </p>
      </header>
      <Suspense fallback={<ResearchesEditorFallback />}>
        <MagazineResearchEditor />
      </Suspense>
    </div>
  );
}
