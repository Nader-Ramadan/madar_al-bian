"use client";

import { useEffect } from "react";
import Image from "next/image";
import styles from "./magazine-banner.module.css";
import { logMagazineTraffic } from "@/lib/traffic-logger";

interface MagazineBannerProps {
  title: string;
  magazineId?: number;
  coverImage?: string;
  description?: string;
}

export default function MagazineBanner({
  title,
  magazineId,
  coverImage = "/images/new-scientist.jpg",
  description,
}: MagazineBannerProps) {
  const useUnoptimizedCover =
    typeof coverImage === "string" &&
    (coverImage.startsWith("http://") ||
      coverImage.startsWith("https://") ||
      coverImage.startsWith("/uploads/"));

  useEffect(() => {
    if (magazineId) {
      logMagazineTraffic(magazineId, "view");
    }
  }, [magazineId]);

  const trimmed = description?.trim();
  const hasDescription = Boolean(trimmed);

  return (
    <section className={styles.shell} aria-labelledby="magazine-banner-title">
      <div className={styles.bgPattern} aria-hidden />
      <div className={styles.inner}>
        <div className={styles.textCol}>
          <span className={styles.eyebrow}>مجلة محكّمة</span>
          <h1 id="magazine-banner-title" className={styles.title}>
            {title}
          </h1>
          <span className={styles.accentLine} aria-hidden />
          {hasDescription ? (
            <p className={styles.description}>{trimmed}</p>
          ) : (
            <p className={styles.descriptionMuted}>لا يتوفر وصف مختصر لهذه المجلة.</p>
          )}
        </div>
        <div className={styles.coverCol}>
          <div className={styles.coverFrame}>
            <Image
              src={coverImage}
              alt={`غلاف ${title}`}
              fill
              className={styles.coverImage}
              sizes="(max-width: 768px) 55vw, 280px"
              priority
              unoptimized={useUnoptimizedCover}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
