import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMagazinePageContext } from "@/lib/magazine-page-context";
import { prisma } from "@/lib/prisma";
import { parseMagazineId } from "@/lib/magazine-id";
import {
  isPublishingConditionIconKey,
  type PublishingConditionIconKey,
} from "@/lib/publishing-condition-icons";
import PublishingConditionsTabs, {
  type PublishingConditionTabItem,
} from "@/app/components/publishing-conditions-tabs";
import styles from "../../../publishing-conditions.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: raw } = await params;
  const magazineId = parseMagazineId(raw);
  if (!magazineId) return { title: "شروط النشر" };
  const ctx = await getMagazinePageContext(magazineId);
  const magazine = await prisma.magazine.findUnique({
    where: { id: magazineId },
    select: { title: true },
  });
  const fallback = ctx?.copy.meta.publishingConditions ?? "شروط النشر";
  if (!magazine) return { title: fallback };
  return { title: `${fallback} | ${magazine.title}` };
}

export default async function MagazinePublishingConditionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: raw } = await params;
  const magazineId = parseMagazineId(raw);
  if (!magazineId) notFound();

  const ctx = await getMagazinePageContext(magazineId);
  if (!ctx) notFound();

  const magazine = await prisma.magazine.findUnique({
    where: { id: magazineId },
    select: { id: true, title: true },
  });
  if (!magazine) notFound();

  const rows = await prisma.magazinePublishingConditionTab.findMany({
    where: { magazineId },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true, title: true, body: true, iconKey: true },
  });

  const tabs: PublishingConditionTabItem[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    iconKey: (isPublishingConditionIconKey(row.iconKey)
      ? row.iconKey
      : "clipboard") as PublishingConditionIconKey,
  }));

  const { copy } = ctx;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.topBar}>
          <Link href={`/magazines/${magazine.id}`} className={styles.backLink}>
            {copy.publishingConditionsPage.backToMagazine}
          </Link>
        </div>

        <section className={styles.hero} aria-labelledby="publishing-conditions-title">
          <span className={styles.heroAccent} aria-hidden />
          <span className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} aria-hidden />
            <span>{magazine.title}</span>
          </span>
          <h1 id="publishing-conditions-title" className={styles.heroTitle}>
            {copy.publishingConditionsPage.title}
          </h1>
          <p className={styles.heroSubtitle}>{copy.publishingConditionsPage.subtitle}</p>
          <div className={styles.heroDivider} aria-hidden />
        </section>

        <PublishingConditionsTabs tabs={tabs} copy={copy} />
      </div>
    </div>
  );
}
