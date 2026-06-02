"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import styles from "../magazines-grid.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { MagazineCard } from "@/lib/load-magazines-page";

export type { MagazineCard };

function formatMetaLine(m: MagazineCard): string | null {
  const parts: string[] = [];
  if (m.issn) parts.push(`ISSN ${m.issn}`);
  if (m.currentVersion) parts.push(`الإصدار الحالي: ${m.currentVersion}`);
  if (m.impactFactor != null && m.impactFactor !== "") {
    const n =
      typeof m.impactFactor === "number"
        ? m.impactFactor
        : Number.parseFloat(String(m.impactFactor));
    if (Number.isFinite(n)) parts.push(`معامل التأثير: ${n.toFixed(3)}`);
  }
  return parts.length ? parts.join(" · ") : null;
}

function isUnoptimizedImage(src: string) {
  return (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("/uploads/")
  );
}

type MagazineBannerImageProps = {
  src: string;
  alt: string;
  wrapperClassName: string;
  sizes: string;
};

function MagazineBannerImage({ src, alt, wrapperClassName, sizes }: MagazineBannerImageProps) {
  const [aspectRatio, setAspectRatio] = useState<string | null>(null);

  return (
    <div
      className={wrapperClassName}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className={styles.image}
        sizes={sizes}
        unoptimized={isUnoptimizedImage(src)}
        onLoadingComplete={({ naturalWidth, naturalHeight }) => {
          if (naturalWidth > 0 && naturalHeight > 0) {
            setAspectRatio(`${naturalWidth} / ${naturalHeight}`);
          }
        }}
      />
    </div>
  );
}

type MagazineCardContentProps = {
  magazine: MagazineCard;
  meta: string | null;
  variant: "grid" | "overlay";
  titleId?: string;
};

function MagazineCardContent({
  magazine,
  meta,
  variant,
  titleId,
}: MagazineCardContentProps) {
  const isOverlay = variant === "overlay";
  const contentClass = isOverlay ? styles.overlayContent : styles.content;
  const titleClass = isOverlay ? styles.overlayTitle : styles.title;
  const descriptionClass = isOverlay ? styles.overlayDescription : styles.description;

  const textBlock = (
    <div className={contentClass}>
      <span className={isOverlay ? styles.overlayCategory : styles.category}>
        {magazine.category}
      </span>
      <h3 id={titleId} className={titleClass}>
        {magazine.title}
      </h3>
      {meta ? (
        <p className={isOverlay ? styles.overlayMetaLine : styles.metaLine}>{meta}</p>
      ) : null}
      <p className={descriptionClass}>{magazine.description}</p>
      {!isOverlay ? (
        <span className={styles.visitBtn}>
          <span>زيارة المجلة</span>
          <span className={styles.ctaChevron} aria-hidden>
            ←
          </span>
        </span>
      ) : (
        <p className={styles.overlayHint}>انقر مرة أخرى للانتقال إلى المجلة</p>
      )}
    </div>
  );

  if (isOverlay) {
    return (
      <div className={styles.overlayLayout}>
        <MagazineBannerImage
          src={magazine.image}
          alt={magazine.title}
          wrapperClassName={styles.overlayImageWrapper}
          sizes="(max-width: 640px) 100vw, 56rem"
        />
        {textBlock}
      </div>
    );
  }

  return (
    <>
      <MagazineBannerImage
        src={magazine.image}
        alt={magazine.title}
        wrapperClassName={styles.imageWrapper}
        sizes="(max-width: 640px) min(100vw, 26rem), (max-width: 900px) 45vw, 280px"
      />
      {textBlock}
    </>
  );
}

type MagazinesGridProps = {
  /** Loaded on the server; avoids client fetch to /api/magazines (Hostinger / proxy issues). */
  initialItems: MagazineCard[];
  initialError: string | null;
};

export default function MagazinesGrid({ initialItems, initialError }: MagazinesGridProps) {
  const router = useRouter();
  const overlayTitleId = useId();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const cardRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const expandedMagazine =
    expandedId != null ? initialItems.find((m) => m.id === expandedId) : undefined;

  const closeOverlay = useCallback(() => {
    setExpandedId((prev) => {
      if (prev != null) {
        const el = cardRefs.current.get(prev);
        requestAnimationFrame(() => el?.focus());
      }
      return null;
    });
  }, []);

  const handleCardClick = useCallback(
    (id: number) => {
      if (expandedId === id) {
        router.push(`/magazines/${id}`);
        return;
      }
      setExpandedId(id);
    },
    [expandedId, router],
  );

  const handleOverlayPanelClick = useCallback(() => {
    if (expandedId != null) {
      router.push(`/magazines/${expandedId}`);
    }
  }, [expandedId, router]);

  const handleCardKeyDown = (e: KeyboardEvent<HTMLButtonElement>, id: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick(id);
    }
  };

  useEffect(() => {
    if (expandedId == null) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (ev: globalThis.KeyboardEvent) => {
      if (ev.key === "Escape") {
        closeOverlay();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [expandedId, closeOverlay]);

  if (initialError) {
    return (
      <section className={styles.section}>
        <p className={styles.errorState}>{initialError}</p>
        <p className={styles.errorHint}>
          إذا كان الجدول فارغاً، طبّق الهجرة ثم شغّل البذور:{" "}
          <code className={styles.inlineCode}>npm run db:seed</code> (أو{" "}
          <code className={styles.inlineCode}>npx prisma db seed</code>
          ) بعد ضبط قاعدة البيانات. للتحقق من واجهة الـ API (اختياري) افتح{" "}
          <code className={styles.inlineCode}>/api/magazines?limit=5</code> في المتصفح.
        </p>
      </section>
    );
  }

  if (initialItems.length === 0) {
    return (
      <section className={styles.section}>
        <p className={styles.emptyState}>لا توجد مجلات لعرضها حالياً.</p>
        <p className={styles.errorHint}>
          لإضافة مجلات تجريبية (3+) بعد ضبط ملف البيئة (.env) وتطبيق الهجرة، نفّذ:{" "}
          <code className={styles.inlineCode}>npm run db:seed</code>
        </p>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {initialItems.map((magazine, index) => {
          const meta = formatMetaLine(magazine);
          const isSelected = expandedId === magazine.id;
          return (
            <button
              key={magazine.id}
              type="button"
              ref={(el) => {
                if (el) cardRefs.current.set(magazine.id, el);
                else cardRefs.current.delete(magazine.id);
              }}
              className={`${styles.card} ${isSelected ? styles.cardSelected : ""}`}
              style={{ animationDelay: `${Math.min(index, 24) * 55}ms` }}
              aria-expanded={isSelected}
              aria-haspopup="dialog"
              onClick={() => handleCardClick(magazine.id)}
              onKeyDown={(e) => handleCardKeyDown(e, magazine.id)}
            >
              <MagazineCardContent magazine={magazine} meta={meta} variant="grid" />
            </button>
          );
        })}
      </div>

      {expandedMagazine ? (
        <div className={styles.overlay} role="presentation">
          <button
            type="button"
            className={styles.overlayBackdrop}
            aria-label="إغلاق المعاينة"
            onClick={closeOverlay}
          />
          <div
            className={styles.overlayPanel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={overlayTitleId}
          >
            <button
              ref={closeButtonRef}
              type="button"
              className={styles.overlayClose}
              aria-label="إغلاق"
              onClick={(e) => {
                e.stopPropagation();
                closeOverlay();
              }}
            >
              ×
            </button>
            <div
              className={styles.overlayBody}
              onClick={handleOverlayPanelClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleOverlayPanelClick();
                }
              }}
              role="button"
              tabIndex={0}
            >
              <MagazineCardContent
                magazine={expandedMagazine}
                meta={formatMetaLine(expandedMagazine)}
                variant="overlay"
                titleId={overlayTitleId}
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
