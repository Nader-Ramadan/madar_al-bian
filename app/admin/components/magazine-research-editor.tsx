"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "@/app/page.module.css";

/** Minimal fields returned by `/api/magazines` that we need */
type Magazine = {
  id: number;
  title: string;
};

type MagazineVersion = {
  id: number;
  magazineId: number;
  version: string;
  title: string;
  releaseDate: string;
  magazine?: { title: string };
};

type MagazineVersionResearch = {
  id: number;
  magazineVersionId: number;
  researcherNames: string;
  title: string;
  externalUrl: string;
  summary: string | null;
  keywords: string | null;
  pdfUrl: string | null;
  sortOrder: number;
};

type ResearchFormState = {
  id?: number;
  researcherNames: string;
  title: string;
  externalUrl: string;
  summary: string;
  keywords: string;
  pdfUrl: string;
  sortOrder: string;
};

const emptyResearchForm: ResearchFormState = {
  researcherNames: "",
  title: "",
  externalUrl: "",
  summary: "",
  keywords: "",
  pdfUrl: "",
  sortOrder: "0",
};

async function readResponseJson(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function VersionsSectionIcon() {
  const common = {
    className: styles.adminSectionIcon,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true as const,
  };
  return (
    <svg {...common}>
      <path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 5v4M11 10v4M8 15v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function MagazineResearchEditor() {
  const searchParams = useSearchParams();
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [versions, setVersions] = useState<MagazineVersion[]>([]);
  const [researchPickMagazineId, setResearchPickMagazineId] = useState("");
  const [researchPickVersionId, setResearchPickVersionId] = useState<number | null>(null);
  const [researches, setResearches] = useState<MagazineVersionResearch[]>([]);
  const [researchForm, setResearchForm] = useState<ResearchFormState>(emptyResearchForm);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const sortedMagazines = useMemo(() => [...magazines].sort((a, b) => b.id - a.id), [magazines]);

  const versionsForResearchPicker = useMemo(() => {
    if (!researchPickMagazineId) return [];
    return versions
      .filter((v) => String(v.magazineId) === researchPickMagazineId)
      .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
  }, [versions, researchPickMagazineId]);

  async function loadMagazinesAndVersions() {
    const [magazinesResponse, versionsResponse] = await Promise.all([
      fetch("/api/magazines?limit=100"),
      fetch("/api/admin/magazine-versions"),
    ]);
    const magazinesPayload = await readResponseJson(magazinesResponse);
    const versionsPayload = await readResponseJson(versionsResponse);
    if (!magazinesResponse.ok || !versionsResponse.ok) throw new Error("Failed to load magazines or versions.");
    const items = (magazinesPayload?.data?.items ?? []) as Magazine[];
    setMagazines(items.map((m) => ({ id: m.id, title: m.title })));
    setVersions((versionsPayload?.data ?? []) as MagazineVersion[]);
  }

  useEffect(() => {
    loadMagazinesAndVersions().catch((e) =>
      setError(e instanceof Error ? e.message : "Failed to load data"),
    );
  }, []);

  useEffect(() => {
    if (magazines.length === 0 || versions.length === 0) return;
    const rawMagazineId = searchParams.get("magazineId");
    const rawVersionId = searchParams.get("versionId");
    if (!rawMagazineId || !rawVersionId) return;
    const magazineExists = magazines.some((m) => String(m.id) === rawMagazineId);
    if (!magazineExists) return;
    const versionId = Number(rawVersionId);
    if (!Number.isFinite(versionId)) return;
    const versionExists = versions.some(
      (v) => v.id === versionId && String(v.magazineId) === rawMagazineId,
    );
    if (!versionExists) return;
    if (researchPickMagazineId !== rawMagazineId) {
      setResearchPickMagazineId(rawMagazineId);
    }
    if (researchPickVersionId !== versionId) {
      setResearchPickVersionId(versionId);
      setResearchForm(emptyResearchForm);
      void loadResearches(versionId).catch((err) => {
        setResearches([]);
        setError(err instanceof Error ? err.message : "Failed to load researches");
      });
    }
  }, [magazines, versions, searchParams, researchPickMagazineId, researchPickVersionId]);

  async function loadResearches(versionId: number) {
    const response = await fetch(`/api/admin/magazine-versions/${versionId}/researches`);
    const payload = await readResponseJson(response);
    if (!response.ok || !payload?.success) throw new Error(payload?.error ?? "Failed to load researches");
    setResearches((payload.data ?? []) as MagazineVersionResearch[]);
  }

  function normalizeResearchPayload(form: ResearchFormState) {
    return {
      researcherNames: form.researcherNames.trim(),
      title: form.title.trim(),
      externalUrl: form.externalUrl.trim(),
      summary: form.summary.trim() || null,
      keywords: form.keywords.trim() || null,
      pdfUrl: form.pdfUrl.trim() || null,
      sortOrder: form.sortOrder.trim() ? Number(form.sortOrder) : 0,
    };
  }

  async function submitResearch(event: FormEvent) {
    event.preventDefault();
    if (researchPickVersionId == null) return;
    setBusy(true);
    setError(null);
    try {
      const body = normalizeResearchPayload(researchForm);
      const url = researchForm.id
        ? `/api/admin/magazine-versions/${researchPickVersionId}/researches/${researchForm.id}`
        : `/api/admin/magazine-versions/${researchPickVersionId}/researches`;
      const response = await fetch(url, {
        method: researchForm.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await readResponseJson(response);
      if (!response.ok || !payload?.success) throw new Error(payload?.error ?? "Research save failed");
      setResearchForm(emptyResearchForm);
      await loadResearches(researchPickVersionId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Research save failed");
    } finally {
      setBusy(false);
    }
  }

  async function deleteResearch(researchId: number) {
    if (researchPickVersionId == null) return;
    if (!confirm("Delete this research entry?")) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/magazine-versions/${researchPickVersionId}/researches/${researchId}`, {
        method: "DELETE",
      });
      const payload = await readResponseJson(response);
      if (!response.ok || !payload?.success) throw new Error(payload?.error ?? "Delete failed");
      await loadResearches(researchPickVersionId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className={styles.adminSection}>
        <div className={styles.adminSectionHeader}>
          <VersionsSectionIcon />
          <h3 className={styles.adminSectionTitle}>Magazine researches</h3>
        </div>
        <p className={styles.adminSubtitle}>Choose a magazine and version, then add or edit research entries.</p>
        <select
          className={styles.adminInput}
          aria-label="Magazine for researches"
          value={researchPickMagazineId}
          onChange={(e) => {
            const mid = e.target.value;
            setResearchPickMagazineId(mid);
            setResearchPickVersionId(null);
            setResearches([]);
            setResearchForm(emptyResearchForm);
          }}
        >
          <option value="">Select magazine</option>
          {sortedMagazines.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>
        <select
          className={styles.adminInput}
          aria-label="Version for researches"
          value={researchPickVersionId ?? ""}
          disabled={!researchPickMagazineId || versionsForResearchPicker.length === 0}
          onChange={(e) => {
            const raw = e.target.value;
            setResearchForm(emptyResearchForm);
            setError(null);
            if (!raw) {
              setResearchPickVersionId(null);
              setResearches([]);
              return;
            }
            const vid = Number(raw);
            setResearchPickVersionId(vid);
            void loadResearches(vid).catch((err) => {
              setResearches([]);
              setError(err instanceof Error ? err.message : "Failed to load researches");
            });
          }}
        >
          <option value="">
            {!researchPickMagazineId
              ? "Select a magazine first"
              : versionsForResearchPicker.length === 0
                ? "No versions for this magazine"
                : "Select version"}
          </option>
          {versionsForResearchPicker.map((v) => (
            <option key={v.id} value={v.id}>
              v{v.version} — {v.title}
            </option>
          ))}
        </select>
      </section>

      {researchPickVersionId !== null ? (
        <section className={styles.adminSection}>
          <div className={styles.adminSectionHeader}>
            <VersionsSectionIcon />
            <h3 className={styles.adminSectionTitle}>
              Researches for version #{researchPickVersionId}
              {versions.find((v) => v.id === researchPickVersionId)?.magazine?.title
                ? ` (${versions.find((v) => v.id === researchPickVersionId)?.magazine?.title})`
                : null}
            </h3>
          </div>
          <p className={styles.adminSubtitle}>
            Public hub:{" "}
            {(() => {
              const ctx = versions.find((v) => v.id === researchPickVersionId);
              const mid = ctx?.magazineId;
              if (!mid) return <span>—</span>;
              return (
                <a href={`/magazines/${mid}/versions/${researchPickVersionId}`} target="_blank" rel="noreferrer">
                  Open version page
                </a>
              );
            })()}
          </p>
          <p className={styles.adminHint}>
            To edit: choose <strong>Edit</strong> on a research row to load it into the form, change fields, then click{" "}
            <strong>Update research</strong>. Use <strong>Cancel edit</strong> to clear the form without saving.
          </p>
          <form className={styles.adminForm} onSubmit={submitResearch}>
            <input
              className={styles.adminInput}
              placeholder="Researcher names (comma-separated)"
              value={researchForm.researcherNames}
              onChange={(e) => setResearchForm((s) => ({ ...s, researcherNames: e.target.value }))}
              required
            />
            <input
              className={styles.adminInput}
              placeholder="Research title"
              value={researchForm.title}
              onChange={(e) => setResearchForm((s) => ({ ...s, title: e.target.value }))}
              required
            />
            <input
              className={styles.adminInput}
              placeholder="External research page URL"
              value={researchForm.externalUrl}
              onChange={(e) => setResearchForm((s) => ({ ...s, externalUrl: e.target.value }))}
              required
            />
            <textarea
              className={styles.adminTextarea}
              placeholder="Summary (optional, shown on site)"
              value={researchForm.summary}
              onChange={(e) => setResearchForm((s) => ({ ...s, summary: e.target.value }))}
            />
            <input
              className={styles.adminInput}
              placeholder="Keywords (comma-separated, shown as tags on site)"
              value={researchForm.keywords}
              onChange={(e) => setResearchForm((s) => ({ ...s, keywords: e.target.value }))}
            />
            <input
              className={styles.adminInput}
              placeholder="Research PDF URL (optional)"
              value={researchForm.pdfUrl}
              onChange={(e) => setResearchForm((s) => ({ ...s, pdfUrl: e.target.value }))}
            />
            <input
              className={styles.adminInput}
              placeholder="Sort order"
              value={researchForm.sortOrder}
              onChange={(e) => setResearchForm((s) => ({ ...s, sortOrder: e.target.value }))}
            />
            <div className={styles.adminActions}>
              <button className={`${styles.adminButton} ${styles.adminButtonPrimary}`} type="submit" disabled={busy}>
                {researchForm.id ? "Update research" : "Add research"}
              </button>
              {researchForm.id ? (
                <button type="button" className={styles.adminButton} onClick={() => setResearchForm(emptyResearchForm)}>
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>
          <ul className={styles.adminList}>
            {researches.map((r) => (
              <li
                key={r.id}
                className={
                  researchForm.id === r.id
                    ? `${styles.adminListItem} ${styles.adminListItemEditing}`
                    : styles.adminListItem
                }
              >
                <span className={styles.adminListText}>
                  <strong>{r.title}</strong>
                  <br />
                  {r.researcherNames}
                  <br />
                  <a href={r.externalUrl} target="_blank" rel="noreferrer">
                    {r.externalUrl}
                  </a>
                </span>
                <div className={styles.adminActions}>
                  <button
                    type="button"
                    className={
                      researchForm.id === r.id
                        ? `${styles.adminButton} ${styles.adminButtonPrimary}`
                        : styles.adminButton
                    }
                    onClick={() =>
                      setResearchForm({
                        id: r.id,
                        researcherNames: r.researcherNames,
                        title: r.title,
                        externalUrl: r.externalUrl,
                        summary: r.summary ?? "",
                        keywords: r.keywords ?? "",
                        pdfUrl: r.pdfUrl ?? "",
                        sortOrder: String(r.sortOrder),
                      })
                    }
                  >
                    Edit
                  </button>
                  <button type="button" className={`${styles.adminButton} ${styles.adminButtonDanger}`} onClick={() => void deleteResearch(r.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {error ? <p className={styles.adminError}>{error}</p> : null}
    </>
  );
}
