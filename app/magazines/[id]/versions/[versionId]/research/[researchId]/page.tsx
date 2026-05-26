import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMagazinePageContext } from "@/lib/magazine-page-context";
import { prisma } from "@/lib/prisma";
import { parseMagazineId } from "@/lib/magazine-id";
import { pdfDownloadPath, sanitizePdfFilename } from "@/lib/pdf-download";
import { splitResearchKeywords } from "@/lib/research-keywords";
import { textDirectionAttrs } from "@/lib/text-direction";
import styles from "../../../../../../magazine-versions-archive.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; versionId: string; researchId: string }>;
}): Promise<Metadata> {
  const { id: rawMag, versionId: rawVer, researchId: rawRes } = await params;
  const magazineId = parseMagazineId(rawMag);
  const versionId = parseMagazineId(rawVer);
  const researchId = parseMagazineId(rawRes);
  if (!magazineId || !versionId || !researchId) return { title: "بحث" };
  const ctx = await getMagazinePageContext(magazineId);
  const research = await prisma.magazineVersionResearch.findFirst({
    where: { id: researchId, magazineVersionId: versionId, magazineVersion: { magazineId } },
    select: { title: true },
  });
  const fallback = ctx?.copy.meta.research ?? "بحث";
  return { title: research?.title ?? fallback };
}

export default async function MagazineVersionResearchDetailPage({
  params,
}: {
  params: Promise<{ id: string; versionId: string; researchId: string }>;
}) {
  const { id: rawMag, versionId: rawVer, researchId: rawRes } = await params;
  const magazineId = parseMagazineId(rawMag);
  const versionId = parseMagazineId(rawVer);
  const researchId = parseMagazineId(rawRes);
  if (!magazineId || !versionId || !researchId) notFound();

  const ctx = await getMagazinePageContext(magazineId);
  if (!ctx) notFound();

  const research = await prisma.magazineVersionResearch.findFirst({
    where: {
      id: researchId,
      magazineVersionId: versionId,
      magazineVersion: { magazineId },
    },
    include: {
      magazineVersion: {
        select: {
          title: true,
          version: true,
          magazine: { select: { title: true } },
        },
      },
    },
  });
  if (!research) notFound();

  const { copy } = ctx;
  const keywordItems = splitResearchKeywords(research.keywords);
  const summaryText = research.summary?.trim() ?? "";
  const hasPdf = Boolean(research.pdfUrl?.trim());
  const pdfHref = hasPdf ? pdfDownloadPath("research", research.id) : "";
  const pdfDownloadName = sanitizePdfFilename(`research-${research.id}`, "research.pdf");
  const researchTitleDir = textDirectionAttrs(research.title);
  const versionTitleDir = textDirectionAttrs(research.magazineVersion.title);
  const magazineTitleDir = textDirectionAttrs(research.magazineVersion.magazine.title);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.topBar}>
          <Link href={`/magazines/${magazineId}/versions/${versionId}`} className={styles.backLink}>
            {copy.research.backToResearches}
          </Link>
          <Link href={`/magazines/${magazineId}`} className={styles.backLink}>
            {copy.research.magazine}
          </Link>
        </div>
        <div className={styles.headerBlock}>
          <p className={styles.subtitle}>
            <span {...magazineTitleDir}>{research.magazineVersion.magazine.title}</span> —{" "}
            <span {...versionTitleDir}>{research.magazineVersion.title}</span> (
            {copy.research.issueLabel(research.magazineVersion.version)})
          </p>
          <h1 className={styles.pageTitle} {...researchTitleDir}>
            {research.title}
          </h1>
          <p className={styles.researchMeta} {...textDirectionAttrs(research.researcherNames)}>
            {research.researcherNames}
          </p>
        </div>

        <article className={styles.researchArticleSheet}>
          <section aria-labelledby="research-summary-heading">
            <h2 id="research-summary-heading" className={styles.researchSummaryTitle}>
              {copy.research.summary}
            </h2>
            <div className={styles.researchSummaryPanel}>
              {summaryText ? (
                <div dir="auto" className={styles.researchSummaryBody}>
                  <p className={styles.researchSummaryText}>{summaryText}</p>
                </div>
              ) : (
                <p className={styles.researchEmptyNote}>{copy.research.noSummary}</p>
              )}
            </div>
          </section>

          <section className={styles.researchKeywordsSection} aria-labelledby="research-keywords-heading">
            <h2 id="research-keywords-heading" className={styles.researchKeywordsHeading}>
              {copy.research.keywords}
            </h2>
            {keywordItems.length > 0 ? (
              <div dir="ltr" className={styles.researchKeywordChipsWrap}>
                <ul className={styles.researchArticleKeywordList}>
                  {keywordItems.map((kw, i) => (
                    <li key={`${i}-${kw}`} className={styles.researchArticleKeywordTag}>
                      {kw}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className={styles.researchEmptyNote}>{copy.research.noKeywords}</p>
            )}
          </section>

          <div className={styles.researchArticleActions}>
            {pdfHref ? (
              <a className={styles.pdfButton} href={pdfHref} download={pdfDownloadName}>
                {copy.research.downloadPdf}
              </a>
            ) : null}
            <a className={styles.externalButton} href={research.externalUrl} target="_blank" rel="noopener noreferrer">
              {copy.research.externalLink}
            </a>
          </div>
        </article>
      </div>
    </div>
  );
}
