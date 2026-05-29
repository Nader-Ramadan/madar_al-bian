import type { MagazineUiCopy } from "@/lib/magazine-ui-copy";

/** Serializable copy slices for Client Components (no functions). */

export type MagazineBannerClientCopy = {
  eyebrow: string;
  noDescription: string;
  coverAlt: string;
};

export type MagazineAdvisorsClientCopy = {
  title: string;
  intro: string;
};

export type MagazineVersionsClientCopy = {
  title: string;
  publishingConditions: string;
  fullArchive: string;
  chevron: string;
  downloadMagazinePdf: string;
  noMagazinePdf: string;
  emptyVersions: string;
  researchesCta: string;
};

export type MagazineVersionItemClient = {
  id: number;
  version: string;
  title: string;
  releaseDateLabel: string;
  notes: string | null;
  issueBadgeLabel: string;
  releaseDateMeta: string;
};

export type PublishingConditionsTabsClientCopy = {
  emptyTitle: string;
  emptyText: string;
  tablistLabel: string;
  sectionsHeader: string;
  mobileTablistLabel: string;
  /** e.g. "القسم {current} / {total}" */
  sectionMetaPattern: string;
};

export function formatSectionMeta(pattern: string, current: string, total: string): string {
  return pattern.replace("{current}", current).replace("{total}", total);
}

export function resolveMagazineBannerCopy(
  copy: MagazineUiCopy,
  title: string,
): MagazineBannerClientCopy {
  return {
    eyebrow: copy.banner.eyebrow,
    noDescription: copy.banner.noDescription,
    coverAlt: copy.banner.coverAlt(title),
  };
}

export function resolveMagazineAdvisorsCopy(copy: MagazineUiCopy): MagazineAdvisorsClientCopy {
  return { title: copy.advisors.title, intro: copy.advisors.intro };
}

export function resolveMagazineVersionsCopy(copy: MagazineUiCopy): MagazineVersionsClientCopy {
  const v = copy.versions;
  return {
    title: v.title,
    publishingConditions: v.publishingConditions,
    fullArchive: v.fullArchive,
    chevron: v.chevron,
    downloadMagazinePdf: v.downloadMagazinePdf,
    noMagazinePdf: v.noMagazinePdf,
    emptyVersions: v.emptyVersions,
    researchesCta: v.researchesCta,
  };
}

export function resolveMagazineVersionItems(
  copy: MagazineUiCopy,
  items: { id: number; version: string; title: string; releaseDateLabel: string; notes: string | null }[],
): MagazineVersionItemClient[] {
  return items.map((item) => ({
    ...item,
    issueBadgeLabel: copy.versions.issueBadge(item.version),
    releaseDateMeta: copy.versions.releaseDate(item.releaseDateLabel),
  }));
}

export function resolvePublishingConditionsTabsCopy(
  copy: MagazineUiCopy,
): PublishingConditionsTabsClientCopy {
  const t = copy.publishingConditionsTabs;
  return {
    emptyTitle: t.emptyTitle,
    emptyText: t.emptyText,
    tablistLabel: t.tablistLabel,
    sectionsHeader: t.sectionsHeader,
    mobileTablistLabel: t.mobileTablistLabel,
    sectionMetaPattern: t.sectionMetaPattern,
  };
}
