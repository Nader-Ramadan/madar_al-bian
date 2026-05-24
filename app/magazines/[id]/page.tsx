import type { Metadata } from "next";
import { notFound } from "next/navigation";
import styles from "../../page.module.css";
import MagazineBanner from "../../components/magazine-banner";
import MagazineContent from "../../components/magazine-content";
import MagazineVersions from "../../components/magazines-versions";
import { prisma } from "@/lib/prisma";
import { parseMagazineId } from "@/lib/magazine-id";
import type { MagazinePublishingAdvisorItem } from "@/app/components/magazine-publishing-advisors";

const ADVISORY_MEMBER_IMAGE_FALLBACK = "/images/advisory-member-placeholder.svg";

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
        select: {
          id: true,
          version: true,
          title: true,
          releaseDate: true,
          notes: true,
        },
      },
      approvedAdvisors: {
        orderBy: { id: "asc" },
        select: {
          advisoryMember: {
            select: { id: true, name: true, title: true, image: true },
          },
        },
      },
      _count: {
        select: { publishingConditionTabs: true },
      },
    },
  });
  if (!magazineRecord) notFound();

  const publishingAdvisors: MagazinePublishingAdvisorItem[] =
    magazineRecord.approvedAdvisors.map((row) => {
      const m = row.advisoryMember;
      const photo = m.image?.trim();
      return {
        id: m.id,
        name: m.name,
        jobTitle: m.title,
        photoUrl: photo && photo.length > 0 ? photo : ADVISORY_MEMBER_IMAGE_FALLBACK,
      };
    });

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
        category={magazineRecord.category}
        publishingAdvisors={publishingAdvisors}
        issn={magazineRecord.issn}
        impactFactor={impactFactorStr}
        currentVersion={magazineRecord.currentVersion}
        nextVersionRelease={nextIso}
        publicationPreference={magazineRecord.publicationPreference}
        versionMessage={magazineRecord.versionMessage}
        certification={magazineRecord.certification}
        versionCount={magazineRecord.versionCount}
        magazineId={magazineRecord.id}
        publishingConditionsCount={magazineRecord._count.publishingConditionTabs}
        contactPhone={magazineRecord.contactPhone}
        contactPhoneTel={magazineRecord.contactPhoneTel}
        contactEmail={magazineRecord.contactEmail}
        contactAddress={magazineRecord.contactAddress}
      />
      <MagazineVersions
        magazineId={magazineRecord.id}
        versions={versionItems}
        pdfUrl={magazineRecord.pdfUrl}
      />
    </div>
  );
}
