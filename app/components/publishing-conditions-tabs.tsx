"use client";

import { useId, useMemo, useState, type KeyboardEvent } from "react";
import styles from "../publishing-conditions.module.css";
import {
  PublishingConditionIcon,
  type PublishingConditionIconKey,
} from "@/lib/publishing-condition-icons";
import {
  formatSectionMeta,
  type PublishingConditionsTabsClientCopy,
} from "@/lib/magazine-ui-copy-client";

export type PublishingConditionTabItem = {
  id: number;
  title: string;
  body: string;
  iconKey: PublishingConditionIconKey;
};

type Props = {
  tabs: PublishingConditionTabItem[];
  copy: PublishingConditionsTabsClientCopy;
};

export default function PublishingConditionsTabs({ tabs, copy }: Props) {
  const baseId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const safeTabs = useMemo(() => tabs.filter(Boolean), [tabs]);

  if (safeTabs.length === 0) {
    return (
      <div className={styles.empty}>
        <h3 className={styles.emptyTitle}>{copy.emptyTitle}</h3>
        <p className={styles.emptyText}>{copy.emptyText}</p>
      </div>
    );
  }

  const active = safeTabs[Math.min(activeIndex, safeTabs.length - 1)];

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      const next = (index + 1) % safeTabs.length;
      setActiveIndex(next);
      focusTab(next);
      return;
    }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      const next = (index - 1 + safeTabs.length) % safeTabs.length;
      setActiveIndex(next);
      focusTab(next);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      focusTab(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(safeTabs.length - 1);
      focusTab(safeTabs.length - 1);
    }
  }

  function focusTab(index: number) {
    const id = `${baseId}-tab-${safeTabs[index].id}`;
    const el = document.getElementById(id);
    if (el) el.focus();
  }

  return (
    <div className={styles.layout}>
      <ul
        className={styles.tabList}
        role="tablist"
        aria-orientation="vertical"
        aria-label={copy.tablistLabel}
      >
        <li className={styles.tabListHeader}>
          <span>{copy.sectionsHeader}</span>
          <span className={styles.tabListHeaderCount}>{safeTabs.length}</span>
        </li>
        {safeTabs.map((tab, index) => {
          const isActive = index === activeIndex;
          const tabId = `${baseId}-tab-${tab.id}`;
          const panelId = `${baseId}-panel-${tab.id}`;
          return (
            <li key={tab.id} role="presentation">
              <button
                type="button"
                id={tabId}
                role="tab"
                aria-selected={isActive}
                aria-controls={panelId}
                tabIndex={isActive ? 0 : -1}
                className={`${styles.tabButton} ${isActive ? styles.tabButtonActive : ""}`}
                onClick={() => setActiveIndex(index)}
                onKeyDown={(e) => handleTabKeyDown(e, index)}
              >
                <span className={styles.tabIcon}>
                  <PublishingConditionIcon iconKey={tab.iconKey} />
                </span>
                <span className={styles.tabLabel}>{tab.title}</span>
                <span className={styles.tabIndex}>{String(index + 1).padStart(2, "0")}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <nav className={styles.mobileTabBar} aria-label={copy.mobileTablistLabel}>
        {safeTabs.map((tab, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={`m-${tab.id}`}
              type="button"
              className={`${styles.mobilePill} ${isActive ? styles.mobilePillActive : ""}`}
              onClick={() => setActiveIndex(index)}
              aria-pressed={isActive}
            >
              <span className={styles.mobilePillIcon}>
                <PublishingConditionIcon iconKey={tab.iconKey} />
              </span>
              <span className={styles.mobilePillText}>{tab.title}</span>
            </button>
          );
        })}
      </nav>

      <article
        id={`${baseId}-panel-${active.id}`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active.id}`}
        className={styles.panel}
      >
        <header className={styles.panelHeader}>
          <span className={styles.panelIcon}>
            <PublishingConditionIcon iconKey={active.iconKey} />
          </span>
          <div>
            <h2 className={styles.panelTitle}>{active.title}</h2>
            <div className={styles.panelMetaRow}>
              <span className={styles.panelMetaPill}>
                {formatSectionMeta(
                  copy.sectionMetaPattern,
                  String(activeIndex + 1).padStart(2, "0"),
                  String(safeTabs.length).padStart(2, "0"),
                )}
              </span>
            </div>
          </div>
        </header>
        <div className={styles.panelBody} dir="auto">
          {active.body.split(/\n{2,}/).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </article>
    </div>
  );
}
