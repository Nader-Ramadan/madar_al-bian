"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import styles from "@/app/page.module.css";
import {
  PUBLISHING_CONDITION_ICON_KEYS,
  PUBLISHING_CONDITION_ICON_LABELS_AR,
  PublishingConditionIcon,
  isPublishingConditionIconKey,
  type PublishingConditionIconKey,
} from "@/lib/publishing-condition-icons";
import { adminCopy } from "@/lib/admin/ar-copy";
import { translateAdminApiMessage } from "@/lib/admin/api-error-ar";

type Magazine = { id: number; title: string };

type PublishingConditionTab = {
  id: number;
  magazineId: number;
  title: string;
  body: string;
  iconKey: string;
  sortOrder: number;
};

type FormState = {
  title: string;
  body: string;
  iconKey: PublishingConditionIconKey;
  sortOrder: string;
};

const emptyForm: FormState = {
  title: "",
  body: "",
  iconKey: "clipboard",
  sortOrder: "0",
};

function parseId(raw: string | undefined): number | null {
  if (!raw) return null;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function readResponseJson(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default function AdminMagazinePublishingConditionsPage() {
  const pc = adminCopy.publishingConditionsPage;
  const c = adminCopy.common;
  const params = useParams();
  const magazineId = parseId(params.id as string | undefined);

  const [magazine, setMagazine] = useState<Magazine | null>(null);
  const [tabs, setTabs] = useState<PublishingConditionTab[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadTabs = useCallback(async () => {
    if (!magazineId) return;
    const response = await fetch(`/api/admin/magazines/${magazineId}/publishing-conditions`);
    const payload = await readResponseJson(response);
    if (!response.ok || !payload?.success) {
      setLoadError(translateAdminApiMessage(payload?.error ?? "Failed to load publishing conditions"));
      return;
    }
    setTabs(payload.data ?? []);
    setLoadError(null);
  }, [magazineId]);

  useEffect(() => {
    if (!magazineId) {
      setLoadError(adminCopy.magazineAdvisorsPage.invalidIdPage);
      return;
    }
    (async () => {
      const response = await fetch(`/api/magazines/${magazineId}`);
      const payload = await readResponseJson(response);
      if (!response.ok || !payload?.success) {
        setLoadError(translateAdminApiMessage(payload?.error ?? "Magazine not found"));
        return;
      }
      setMagazine({ id: payload.data.id, title: payload.data.title });
      await loadTabs();
    })();
  }, [magazineId, loadTabs]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setSubmitError(null);
  }

  function startEdit(tab: PublishingConditionTab) {
    setEditingId(tab.id);
    setForm({
      title: tab.title,
      body: tab.body,
      iconKey: isPublishingConditionIconKey(tab.iconKey) ? tab.iconKey : "clipboard",
      sortOrder: String(tab.sortOrder ?? 0),
    });
    setSubmitError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!magazineId) return;
    setBusy(true);
    setSubmitError(null);
    try {
      const payload = {
        title: form.title.trim(),
        body: form.body.trim(),
        iconKey: form.iconKey,
        sortOrder: form.sortOrder.trim() ? Number(form.sortOrder) : 0,
      };
      const url = editingId
        ? `/api/admin/magazines/${magazineId}/publishing-conditions/${editingId}`
        : `/api/admin/magazines/${magazineId}/publishing-conditions`;
      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responsePayload = await readResponseJson(response);
      if (!response.ok || !responsePayload?.success) {
        setSubmitError(translateAdminApiMessage(responsePayload?.error ?? "Could not save publishing condition"));
        return;
      }
      resetForm();
      await loadTabs();
    } catch (err) {
      setSubmitError(translateAdminApiMessage(err instanceof Error ? err.message : "Could not save publishing condition"));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(tabId: number) {
    if (!magazineId) return;
    if (!confirm(pc.confirmDelete)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/magazines/${magazineId}/publishing-conditions/${tabId}`, {
        method: "DELETE",
      });
      const payload = await readResponseJson(response);
      if (!response.ok || !payload?.success) {
        alert(translateAdminApiMessage(payload?.error ?? "Delete failed"));
        return;
      }
      if (editingId === tabId) resetForm();
      await loadTabs();
    } finally {
      setBusy(false);
    }
  }

  if (!magazineId) {
    return (
      <div className={styles.adminPage}>
        <p className={styles.adminError}>{adminCopy.magazineAdvisorsPage.invalidIdPage}</p>
      </div>
    );
  }

  return (
    <div className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <div className={styles.adminSubtitle}>
          <Link href="/admin/magazines">{c.backToMagazines}</Link>
        </div>
        <h1 className={styles.adminTitle}>{pc.title}</h1>
        <p className={styles.adminSectionExplainer}>{pc.explainer}</p>
        <p className={styles.adminSubtitle}>{magazine ? magazine.title : loadError ? loadError : c.loading}</p>
        {magazine ? (
          <p className={styles.adminSubtitle}>
            {pc.publicExplainer}{" "}
            <a href={`/magazines/${magazine.id}/publishing-conditions`} target="_blank" rel="noreferrer">
              {c.openInNewTab}
            </a>
          </p>
        ) : null}
      </header>

      {loadError && !magazine ? (
        <p className={styles.adminError}>{loadError}</p>
      ) : (
        <>
          <section className={styles.adminSection}>
            <h3 className={styles.adminSectionTitle}>{pc.currentTabsTitle}</h3>
            <p className={styles.adminSectionExplainer}>{pc.tabsListExplainer}</p>
            {tabs.length === 0 ? (
              <p className={styles.adminEmpty}>{pc.emptyTabs}</p>
            ) : (
              <ul className={styles.adminList}>
                {tabs.map((tab) => {
                  const safeIcon: PublishingConditionIconKey = isPublishingConditionIconKey(tab.iconKey) ? tab.iconKey : "clipboard";
                  const iconLabel = PUBLISHING_CONDITION_ICON_LABELS_AR[safeIcon];
                  const preview = tab.body.length > 140 ? `${tab.body.slice(0, 140)}…` : tab.body;
                  return (
                    <li
                      key={tab.id}
                      className={
                        editingId === tab.id
                          ? `${styles.adminListItem} ${styles.adminListItemEditing ?? ""}`
                          : styles.adminListItem
                      }
                    >
                      <span className={styles.adminListText}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                          <span
                            style={{
                              width: "1.5rem",
                              height: "1.5rem",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "var(--secondary-color)",
                            }}
                            aria-hidden
                          >
                            <PublishingConditionIcon iconKey={safeIcon} />
                          </span>
                          <strong>{tab.title}</strong>
                        </span>
                        <br />
                        <span style={{ fontSize: "0.85rem", color: "#5c6e90" }}>
                          {c.iconLabel} {iconLabel} ({safeIcon}) · {c.sortLabel} {tab.sortOrder}
                        </span>
                        <br />
                        <span style={{ fontSize: "0.88rem", color: "#5c6e90", whiteSpace: "pre-wrap" }}>{preview}</span>
                      </span>
                      <div className={styles.adminActions}>
                        <button type="button" className={styles.adminButton} disabled={busy} onClick={() => startEdit(tab)}>
                          {c.edit}
                        </button>
                        <button type="button" className={`${styles.adminButton} ${styles.adminButtonDanger}`} disabled={busy} onClick={() => handleDelete(tab.id)}>
                          {c.remove}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className={styles.adminSection}>
            <h3 className={styles.adminSectionTitle}>{editingId ? pc.editTab : pc.addTab}</h3>
            <p className={styles.adminSectionExplainer}>{pc.formExplainer}</p>
            <form className={styles.adminForm} onSubmit={handleSubmit}>
              <input
                className={styles.adminInput}
                placeholder={pc.placeholderTabTitle}
                value={form.title}
                onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                required
                minLength={2}
                maxLength={255}
              />
              <textarea
                className={styles.adminTextarea}
                placeholder={pc.placeholderTabBody}
                value={form.body}
                onChange={(e) => setForm((s) => ({ ...s, body: e.target.value }))}
                required
                minLength={2}
                maxLength={50000}
                rows={10}
                dir="auto"
              />
              <select
                className={styles.adminInput}
                value={form.iconKey}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    iconKey: e.target.value as PublishingConditionIconKey,
                  }))
                }
              >
                {PUBLISHING_CONDITION_ICON_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {PUBLISHING_CONDITION_ICON_LABELS_AR[key]} — {key}
                  </option>
                ))}
              </select>
              <input className={styles.adminInput} type="number" min={0} placeholder={pc.placeholderSort} value={form.sortOrder} onChange={(e) => setForm((s) => ({ ...s, sortOrder: e.target.value }))} />
              {submitError ? <p className={styles.adminError}>{submitError}</p> : null}
              <div className={styles.adminActions}>
                <button type="submit" className={`${styles.adminButton} ${styles.adminButtonPrimary}`} disabled={busy}>
                  {busy ? pc.submitWorking : editingId ? pc.submitUpdate : pc.submitAdd}
                </button>
                {editingId ? (
                  <button type="button" className={styles.adminButton} onClick={resetForm}>
                    {c.cancel}
                  </button>
                ) : null}
              </div>
            </form>
          </section>
        </>
      )}
    </div>
  );
}
