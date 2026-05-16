import { Suspense } from "react";
import MagazineResearchEditor from "@/app/admin/components/magazine-research-editor";
import styles from "@/app/page.module.css";
import { adminCopy } from "@/lib/admin/ar-copy";

function ResearchesEditorFallback() {
  return (
    <p className={styles.adminSubtitle} aria-busy="true">
      {adminCopy.researchesPage.loadingEditor}
    </p>
  );
}

export default function AdminMagazineResearchesPage() {
  const rp = adminCopy.researchesPage;
  return (
    <div className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>{rp.title}</h1>
        <p className={styles.adminSectionExplainer}>{rp.explainer}</p>
      </header>
      <Suspense fallback={<ResearchesEditorFallback />}>
        <MagazineResearchEditor />
      </Suspense>
    </div>
  );
}
