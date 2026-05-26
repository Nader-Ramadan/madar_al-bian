import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMagazinePageContext } from "@/lib/magazine-page-context";
import { prisma } from "@/lib/prisma";
import { parseMagazineId } from "@/lib/magazine-id";
import { textDirectionAttrs } from "@/lib/text-direction";
import styles from "../../../../magazine-versions-archive.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; versionId: string }>;
}): Promise<Metadata> {
  const { id: rawMag, versionId: rawVer } = await params;
  const magazineId = parseMagazineId(rawMag);
  const versionId = parseMagazineId(rawVer);
  if (!magazineId || !versionId) return { title: "إصدار المجلة" };
  const ctx = await getMagazinePageContext(magazineId);
  const row = await prisma.magazineVersion.findFirst({
    where: { id: versionId, magazineId },
    select: { title: true, magazine: { select: { title: true } } },
  });
  const fallback = ctx?.copy.meta.magazineIssue ?? "إصدار المجلة";
  if (!row) return { title: fallback };
  return { title: `${row.magazine.title} | ${row.title}` };
}

export default async function MagazineVersionHubPage({
  params,
}: {
  params: Promise<{ id: string; versionId: string }>;
}) {
  const { id: rawMag, versionId: rawVer } = await params;
  const magazineId = parseMagazineId(rawMag);
  const versionId = parseMagazineId(rawVer);
  if (!magazineId || !versionId) notFound();

  const ctx = await getMagazinePageContext(magazineId);
  if (!ctx) notFound();

  const version = await prisma.magazineVersion.findFirst({
    where: { id: versionId, magazineId },
    include: {
      magazine: { select: { id: true, title: true } },
      researches: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
    },
  });
  if (!version) notFound();

  const { copy } = ctx;
  const versionTitleDir = textDirectionAttrs(version.title);
  const magazineTitleDir = textDirectionAttrs(version.magazine.title);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.topBar}>
          <Link href={`/magazines/${magazineId}`} className={styles.backLink}>
            {copy.versionHub.backToMagazine}
          </Link>
          <Link href={`/magazines/${magazineId}/versions`} className={styles.backLink}>
            {copy.versionHub.versionsArchive}
          </Link>
        </div>
        <div className={styles.headerBlock}>
          <h1 className={styles.pageTitle} {...versionTitleDir}>
            {version.title}
          </h1>
          <p className={styles.subtitle}>
            <span {...magazineTitleDir}>{version.magazine.title}</span> —{" "}
            {copy.versionHub.issueLabel(version.version)}
          </p>
        </div>

        {version.researches.length === 0 ? (
          <div className={styles.empty}>{copy.versionHub.emptyResearches}</div>
        ) : (
          <div className={styles.researchList}>
            {version.researches.map((r) => (
              <article key={r.id} className={styles.researchCard}>
                <h2 className={styles.researchCardTitle} {...textDirectionAttrs(r.title)}>
                  <Link
                    href={`/magazines/${magazineId}/versions/${versionId}/research/${r.id}`}
                    className={styles.researchCardTitleLink}
                  >
                    {r.title}
                  </Link>
                </h2>
                <div className={styles.researchAuthorRow}>
                  <svg
                    className={styles.researchAuthorIcon}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  <span className={styles.researchMeta}>{r.researcherNames}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
