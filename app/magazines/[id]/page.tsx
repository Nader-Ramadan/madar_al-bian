import type { Metadata } from "next";
import { notFound } from "next/navigation";
import styles from "../../page.module.css";
import MagazineBanner from "../../components/magazine-banner";
import MagazineContent from "../../components/magazine-content";
import MagazineVersions from "../../components/magazines-versions";
import { prisma } from "@/lib/prisma";

function parseMagazineId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: rawId } = await params;
  const id = parseMagazineId(rawId);
  if (!id) return { title: "مجلة" };
  const magazine = await prisma.magazine.findUnique({
    where: { id },
    select: { title: true },
  });
  return { title: magazine?.title ?? "مجلة" };
}

export default async function MagazinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = parseMagazineId(rawId);
  if (!id) notFound();

  const magazineRecord = await prisma.magazine.findUnique({
    where: { id },
    include: {
      versions: {
        orderBy: { releaseDate: "desc" },
      },
    },
  });
  if (!magazineRecord) notFound();

  const impactFactorStr =
    magazineRecord.impactFactor != null ? magazineRecord.impactFactor.toString() : null;
  const nextIso = magazineRecord.nextVersionRelease
    ? magazineRecord.nextVersionRelease.toISOString()
    : null;

  const versionItems = magazineRecord.versions.map((v) => ({
    id: v.id,
    version: v.version,
    title: v.title,
    releaseDateLabel: new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(v.releaseDate),
    notes: v.notes,
  }));

  return (
    <div className={styles.page}>
      <MagazineBanner
        title={magazineRecord.title}
        magazineId={magazineRecord.id}
        coverImage={magazineRecord.image}
        description={magazineRecord.description}
      />
      <MagazineContent
        title={magazineRecord.title}
        description={magazineRecord.description}
        image={magazineRecord.image}
        category={magazineRecord.category}
        issn={magazineRecord.issn}
        impactFactor={impactFactorStr}
        currentVersion={magazineRecord.currentVersion}
        nextVersionRelease={nextIso}
        publicationPreference={magazineRecord.publicationPreference}
        versionMessage={magazineRecord.versionMessage}
        certification={magazineRecord.certification}
        versionCount={magazineRecord.versionCount}
      />
      <MagazineVersions versions={versionItems} pdfUrl={magazineRecord.pdfUrl} />
    </div>
  );
}
