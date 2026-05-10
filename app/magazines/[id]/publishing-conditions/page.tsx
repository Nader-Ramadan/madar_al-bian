import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
  const magazine = await prisma.magazine.findUnique({
    where: { id: magazineId },
    select: { title: true },
  });
  if (!magazine) return { title: "شروط النشر" };
  return { title: `شروط النشر | ${magazine.title}` };
}

export default async function MagazinePublishingConditionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: raw } = await params;
  const magazineId = parseMagazineId(raw);
  if (!magazineId) notFound();

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

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.topBar}>
          <Link href={`/magazines/${magazine.id}`} className={styles.backLink}>
            ← العودة للمجلة
          </Link>
        </div>

        <section className={styles.hero} aria-labelledby="publishing-conditions-title">
          <span className={styles.heroAccent} aria-hidden />
          <span className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} aria-hidden />
            <span>{magazine.title}</span>
          </span>
          <h1 id="publishing-conditions-title" className={styles.heroTitle}>
            شروط النشر
          </h1>
          <p className={styles.heroSubtitle}>
            تعرّف على المتطلبات والإرشادات التي يجب اتّباعها قبل تقديم بحثك إلى المجلة.
          </p>
          <div className={styles.heroDivider} aria-hidden />
        </section>

        <PublishingConditionsTabs tabs={tabs} />
      </div>
    </div>
  );
}
