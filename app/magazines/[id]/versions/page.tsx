import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMagazinePageContext } from "@/lib/magazine-page-context";
import { pdfDownloadPath, sanitizePdfFilename } from "@/lib/pdf-download";
import type { MagazineUiCopy } from "@/lib/magazine-ui-copy";
import { prisma } from "@/lib/prisma";
import { parseMagazineId } from "@/lib/magazine-id";
import { textDirectionAttrs } from "@/lib/text-direction";
import styles from "../../../magazine-versions-archive.module.css";

function formatReleaseDate(d: Date, dateLocale: string): string {
  return new Intl.DateTimeFormat(dateLocale, {
    calendar: "gregory",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

type LegacyVersion = {
  id: number;
  title: string;
  notes: string | null;
  releaseDate: Date;
  pageCount: number | null;
  pdfUrl: string | null;
};

function isMissingVersionColumnError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const code = (err as { code?: unknown }).code;
  const meta = (err as { meta?: unknown }).meta as { column?: unknown } | undefined;
  return (
    code === "P2022" &&
    typeof meta?.column === "string" &&
    (meta.column.includes("magazine_versions.pageCount") ||
      meta.column.includes("magazine_versions.pdfUrl"))
  );
}

function PagesColumn({
  pageCount,
  pdfUrl,
  versionId,
  copy,
}: {
  pageCount: number | null;
  pdfUrl: string | null;
  versionId: number;
  copy: MagazineUiCopy;
}) {
  const pdfHref = pdfUrl?.trim() ? pdfDownloadPath("version", versionId) : null;
  const pdfDownloadName = sanitizePdfFilename(`version-${versionId}`, "version.pdf");

  if (pageCount != null && pdfHref) {
    return (
      <a href={pdfHref} className={styles.pagesLink} download={pdfDownloadName}>
        {copy.archive.pageCountLink(pageCount)}
      </a>
    );
  }
  if (pdfHref) {
    return (
      <a href={pdfHref} className={styles.pagesLink} download={pdfDownloadName}>
        {copy.archive.downloadPdf}
      </a>
    );
  }
  if (pageCount != null) {
    return <span className={styles.pagesPlain}>{copy.archive.pageCountPlain(pageCount)}</span>;
  }
  return <span className={styles.pagesMuted}>{copy.archive.unspecified}</span>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: raw } = await params;
  const magazineId = parseMagazineId(raw);
  if (!magazineId) return { title: "إصدارات المجلة" };
  const ctx = await getMagazinePageContext(magazineId);
  const magazine = await prisma.magazine.findUnique({
    where: { id: magazineId },
    select: { title: true },
  });
  const fallback = ctx?.copy.meta.versionsArchive ?? "إصدارات المجلة";
  if (!magazine) return { title: fallback };
  return { title: `${fallback} | ${magazine.title}` };
}

export default async function MagazineVersionsArchivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: raw } = await params;
  const magazineId = parseMagazineId(raw);
  if (!magazineId) notFound();

  const ctx = await getMagazinePageContext(magazineId);
  if (!ctx) notFound();

  const baseMagazine = await prisma.magazine.findUnique({
    where: { id: magazineId },
    select: { id: true, title: true },
  });
  if (!baseMagazine) notFound();

  let versions: LegacyVersion[] = [];
  try {
    const richVersions = await prisma.magazineVersion.findMany({
      where: { magazineId },
      orderBy: { releaseDate: "desc" },
      select: {
        id: true,
        title: true,
        notes: true,
        releaseDate: true,
        pageCount: true,
        pdfUrl: true,
      },
    });
    versions = richVersions;
  } catch (err) {
    if (!isMissingVersionColumnError(err)) throw err;
    const legacyVersions = await prisma.magazineVersion.findMany({
      where: { magazineId },
      orderBy: { releaseDate: "desc" },
      select: {
        id: true,
        title: true,
        notes: true,
        releaseDate: true,
      },
    });
    versions = legacyVersions.map((v) => ({ ...v, pageCount: null, pdfUrl: null }));
  }

  const { copy } = ctx;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.topBar}>
          <Link href={`/magazines/${baseMagazine.id}`} className={styles.backLink}>
            {copy.archive.backToMagazine}
          </Link>
          <div className={styles.headerBlock}>
            <h1 className={styles.pageTitle}>{copy.archive.versionsTitle}</h1>
            <p className={styles.subtitle} {...textDirectionAttrs(baseMagazine.title)}>
              {baseMagazine.title}
            </p>
          </div>
        </div>

        {versions.length === 0 ? (
          <div className={styles.empty}>{copy.archive.emptyVersions}</div>
        ) : (
          <div className={styles.grid}>
            {versions.map((v, index) => {
              const isLatest = index === 0;
              return (
                <article key={v.id} className={styles.card}>
                  <div className={styles.main}>
                    <div className={styles.badgeRow}>
                      {isLatest ? <span className={styles.latestBadge}>{copy.archive.latestBadge}</span> : null}
                    </div>
                    <h2 className={styles.issueTitle} {...textDirectionAttrs(v.title)}>
                      {v.title}
                    </h2>
                    <p className={styles.dateLine}>{formatReleaseDate(v.releaseDate, ctx.dateLocale)}</p>
                    {v.notes?.trim() ? <p className={styles.notes}>{v.notes.trim()}</p> : null}
                    <div className={styles.versionResearchRow}>
                      <Link
                        href={`/magazines/${magazineId}/versions/${v.id}`}
                        className={styles.versionResearchButton}
                      >
                        {copy.archive.researchesCta}
                      </Link>
                    </div>
                  </div>
                  <div className={styles.side}>
                    <PagesColumn
                      pageCount={v.pageCount}
                      pdfUrl={v.pdfUrl}
                      versionId={v.id}
                      copy={copy}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
