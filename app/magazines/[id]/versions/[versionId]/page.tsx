import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseMagazineId } from "@/lib/magazine-id";
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
  const row = await prisma.magazineVersion.findFirst({
    where: { id: versionId, magazineId },
    select: { title: true, magazine: { select: { title: true } } },
  });
  if (!row) return { title: "إصدار المجلة" };
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

  const version = await prisma.magazineVersion.findFirst({
    where: { id: versionId, magazineId },
    include: {
      magazine: { select: { id: true, title: true } },
      researches: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
    },
  });
  if (!version) notFound();

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.topBar}>
          <Link href={`/magazines/${magazineId}`} className={styles.backLink}>
            ← العودة للمجلة
          </Link>
          <Link href={`/magazines/${magazineId}/versions`} className={styles.backLink}>
            سجل الإصدارات
          </Link>
        </div>
        <div className={styles.headerBlock}>
          <h1 className={styles.pageTitle}>{version.title}</h1>
          <p className={styles.subtitle}>
            {version.magazine.title} — إصدار {version.version}
          </p>
        </div>

        {version.researches.length === 0 ? (
          <div className={styles.empty}>لا توجد بحوث مسجّلة لهذا الإصدار بعد.</div>
        ) : (
          <div className={styles.researchList}>
            {version.researches.map((r) => (
              <article key={r.id} className={styles.researchCard}>
                <h2 className={styles.researchCardTitle}>
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
