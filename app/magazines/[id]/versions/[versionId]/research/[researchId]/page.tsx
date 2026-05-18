import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseMagazineId } from "@/lib/magazine-id";
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
  const research = await prisma.magazineVersionResearch.findFirst({
    where: { id: researchId, magazineVersionId: versionId, magazineVersion: { magazineId } },
    select: { title: true },
  });
  return { title: research?.title ?? "بحث" };
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

  const keywordItems = splitResearchKeywords(research.keywords);
  const summaryText = research.summary?.trim() ?? "";
  const pdfHref = research.pdfUrl?.trim() ?? "";
  const researchTitleDir = textDirectionAttrs(research.title);
  const versionTitleDir = textDirectionAttrs(research.magazineVersion.title);
  const magazineTitleDir = textDirectionAttrs(research.magazineVersion.magazine.title);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.topBar}>
          <Link href={`/magazines/${magazineId}/versions/${versionId}`} className={styles.backLink}>
            ← العودة لقائمة البحوث
          </Link>
          <Link href={`/magazines/${magazineId}`} className={styles.backLink}>
            المجلة
          </Link>
        </div>
        <div className={styles.headerBlock}>
          <p className={styles.subtitle}>
            <span {...magazineTitleDir}>{research.magazineVersion.magazine.title}</span> —{" "}
            <span {...versionTitleDir}>{research.magazineVersion.title}</span> (إصدار{" "}
            {research.magazineVersion.version})
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
              الملخص
            </h2>
            <div className={styles.researchSummaryPanel}>
              {summaryText ? (
                <div dir="auto" className={styles.researchSummaryBody}>
                  <p className={styles.researchSummaryText}>{summaryText}</p>
                </div>
              ) : (
                <p className={styles.researchEmptyNote}>لم يُضف ملخص لهذا البحث بعد.</p>
              )}
            </div>
          </section>

          <section className={styles.researchKeywordsSection} aria-labelledby="research-keywords-heading">
            <h2 id="research-keywords-heading" className={styles.researchKeywordsHeading}>
              :الكلمات المفتاحية
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
              <p className={styles.researchEmptyNote}>لا توجد كلمات مفتاحية مسجّلة لهذا البحث.</p>
            )}
          </section>

          <div className={styles.researchArticleActions}>
            {pdfHref ? (
              <a className={styles.pdfButton} href={pdfHref} target="_blank" rel="noopener noreferrer">
                تحميل البحث (PDF)
              </a>
            ) : null}
            <a className={styles.externalButton} href={research.externalUrl} target="_blank" rel="noopener noreferrer">
              فتح صفحة البحث الأصلية
            </a>
          </div>
        </article>
      </div>
    </div>
  );
}
