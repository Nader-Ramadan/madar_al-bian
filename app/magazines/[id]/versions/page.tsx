import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseMagazineId } from "@/lib/magazine-id";
import styles from "../../../magazine-versions-archive.module.css";

function formatReleaseDate(d: Date): string {
  return new Intl.DateTimeFormat("ar-EG", {
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
}: {
  pageCount: number | null;
  pdfUrl: string | null;
}) {
  if (pageCount != null && pdfUrl) {
    return (
      <a href={pdfUrl} className={styles.pagesLink} target="_blank" rel="noopener noreferrer">
        عدد الأوراق ({pageCount})
      </a>
    );
  }
  if (pdfUrl) {
    return (
      <a href={pdfUrl} className={styles.pagesLink} target="_blank" rel="noopener noreferrer">
        تحميل PDF
      </a>
    );
  }
  if (pageCount != null) {
    return <span className={styles.pagesPlain}>عدد الأوراق ({pageCount})</span>;
  }
  return <span className={styles.pagesMuted}>غير محدد</span>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: raw } = await params;
  const magazineId = parseMagazineId(raw);
  if (!magazineId) return { title: "إصدارات المجلة" };
  const magazine = await prisma.magazine.findUnique({
    where: { id: magazineId },
    select: { title: true },
  });
  if (!magazine) return { title: "إصدارات المجلة" };
  return { title: `إصدارات المجلة | ${magazine.title}` };
}

export default async function MagazineVersionsArchivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: raw } = await params;
  const magazineId = parseMagazineId(raw);
  if (!magazineId) notFound();

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

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.topBar}>
          <Link href={`/magazines/${baseMagazine.id}`} className={styles.backLink}>
            ← العودة للمجلة
          </Link>
          <div className={styles.headerBlock}>
            <h1 className={styles.pageTitle}>إصدارات المجلة</h1>
            <p className={styles.subtitle}>{baseMagazine.title}</p>
          </div>
        </div>

        {versions.length === 0 ? (
          <div className={styles.empty}>لا توجد إصدارات مسجّلة لهذه المجلة بعد.</div>
        ) : (
          <div className={styles.grid}>
            {versions.map((v, index) => {
              const isLatest = index === 0;
              return (
                <article key={v.id} className={styles.card}>
                  <div className={styles.main}>
                    <div className={styles.badgeRow}>
                      {isLatest ? <span className={styles.latestBadge}>أحدث إصدار</span> : null}
                    </div>
                    <h2 className={styles.issueTitle}>{v.title}</h2>
                    <p className={styles.dateLine}>{formatReleaseDate(v.releaseDate)}</p>
                    {v.notes?.trim() ? <p className={styles.notes}>{v.notes.trim()}</p> : null}
                  </div>
                  <div className={styles.side}>
                    <PagesColumn pageCount={v.pageCount} pdfUrl={v.pdfUrl} />
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
