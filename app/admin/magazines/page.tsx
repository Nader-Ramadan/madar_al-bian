"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import styles from "@/app/page.module.css";

type Magazine = {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  pdfUrl: string | null;
  issn: string | null;
  impactFactor: number | null;
  currentVersion: string | null;
  nextVersionRelease: string | null;
  publicationPreference: string | null;
  versionMessage: string | null;
  certification: string | null;
  advisorsApproved: boolean;
  approvedAdvisors?: Array<{
    advisoryMemberId: number;
    advisoryMember: { id: number; name: string; title: string };
  }>;
  versionCount: number;
};

type MagazineVersion = {
  id: number;
  magazineId: number;
  version: string;
  title: string;
  releaseDate: string;
  notes?: string | null;
  pageCount?: number | null;
  pdfUrl?: string | null;
  magazine?: { title: string };
};

type MagazineFormState = {
  title: string;
  description: string;
  image: string;
  category: string;
  pdfUrl: string;
  issn: string;
  impactFactor: string;
  currentVersion: string;
  nextVersionRelease: string;
  publicationPreference: string;
  versionMessage: string;
  certification: string;
  approvedAdvisorIds: number[];
};

type AdvisorOption = {
  id: number;
  name: string;
  title: string;
};

type VersionFormState = {
  id?: number;
  magazineId: string;
  version: string;
  title: string;
  releaseDate: string;
  notes: string;
  pageCount: string;
  pdfUrl: string;
};

function SectionIcon({ kind }: { kind: "edit" | "list" | "versions" | "release" }) {
  const common = { className: styles.adminSectionIcon, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true as const };
  if (kind === "edit") return <svg {...common}><path d="M4 20h4l10-10-4-4L4 16z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="m12.5 7.5 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  if (kind === "list") return <svg {...common}><path d="M7 7h13M7 12h13M7 17h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="3.5" cy="7" r="1" fill="currentColor" /><circle cx="3.5" cy="12" r="1" fill="currentColor" /><circle cx="3.5" cy="17" r="1" fill="currentColor" /></svg>;
  if (kind === "versions") return <svg {...common}><path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M16 5v4M11 10v4M8 15v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  return <svg {...common}><path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /></svg>;
}

const emptyMagazineForm: MagazineFormState = {
  title: "",
  description: "",
  image: "",
  category: "",
  pdfUrl: "",
  issn: "",
  impactFactor: "",
  currentVersion: "",
  nextVersionRelease: "",
  publicationPreference: "",
  versionMessage: "",
  certification: "",
  approvedAdvisorIds: [],
};

const emptyVersionForm: VersionFormState = {
  magazineId: "",
  version: "",
  title: "",
  releaseDate: "",
  notes: "",
  pageCount: "",
  pdfUrl: "",
};

function toDateInput(value: string | null | undefined) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function normalizeMagazinePayload(form: MagazineFormState) {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    image: form.image.trim(),
    category: form.category.trim(),
    pdfUrl: form.pdfUrl.trim() || null,
    issn: form.issn.trim() || null,
    impactFactor: form.impactFactor.trim() ? Number(form.impactFactor) : null,
    currentVersion: form.currentVersion.trim() || null,
    nextVersionRelease: form.nextVersionRelease ? new Date(form.nextVersionRelease) : null,
    publicationPreference: form.publicationPreference.trim() || null,
    versionMessage: form.versionMessage.trim() || null,
    certification: form.certification.trim() || null,
    approvedAdvisorIds: form.approvedAdvisorIds,
  };
}

function normalizeVersionPayload(form: VersionFormState) {
  return {
    magazineId: Number(form.magazineId),
    version: form.version.trim(),
    title: form.title.trim(),
    releaseDate: new Date(form.releaseDate).toISOString(),
    notes: form.notes.trim() || null,
    pageCount: form.pageCount.trim() ? Number(form.pageCount) : null,
    pdfUrl: form.pdfUrl.trim() || null,
  };
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

export default function AdminMagazinesPage() {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [versions, setVersions] = useState<MagazineVersion[]>([]);
  const [magazineSearch, setMagazineSearch] = useState("");
  const [versionSearch, setVersionSearch] = useState("");
  const [magForm, setMagForm] = useState<MagazineFormState>(emptyMagazineForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [versionForm, setVersionForm] = useState<VersionFormState>(emptyVersionForm);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [advisorSource, setAdvisorSource] = useState<"global" | "attached" | "both">("both");
  const [globalAdvisors, setGlobalAdvisors] = useState<AdvisorOption[]>([]);
  const [attachedAdvisors, setAttachedAdvisors] = useState<AdvisorOption[]>([]);

  const sortedMagazines = useMemo(() => [...magazines].sort((a, b) => b.id - a.id), [magazines]);
  const filteredMagazines = useMemo(() => {
    const q = magazineSearch.trim().toLowerCase();
    if (!q) return sortedMagazines;
    return sortedMagazines.filter((item) => item.title.toLowerCase().includes(q));
  }, [sortedMagazines, magazineSearch]);
  const filteredVersions = useMemo(() => {
    const q = versionSearch.trim().toLowerCase();
    if (!q) return versions;
    return versions.filter((item) => {
      const title = item.magazine?.title?.toLowerCase() ?? "";
      const version = item.version.toLowerCase();
      return title.includes(q) || version.includes(q);
    });
  }, [versions, versionSearch]);
  const advisorOptions = useMemo(() => {
    const map = new Map<number, AdvisorOption>();
    if (advisorSource === "global" || advisorSource === "both") {
      for (const advisor of globalAdvisors) map.set(advisor.id, advisor);
    }
    if (advisorSource === "attached" || advisorSource === "both") {
      for (const advisor of attachedAdvisors) map.set(advisor.id, advisor);
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [advisorSource, globalAdvisors, attachedAdvisors]);
  const selectedAdvisorSummary = useMemo(() => {
    const selected = new Set(magForm.approvedAdvisorIds);
    return advisorOptions.filter((advisor) => selected.has(advisor.id));
  }, [advisorOptions, magForm.approvedAdvisorIds]);

  async function loadAttachedAdvisors(magazineId: number) {
    const response = await fetch(`/api/admin/magazines/${magazineId}/advisors`);
    const payload = await readResponseJson(response);
    if (!response.ok || !payload?.success) {
      setAttachedAdvisors([]);
      return;
    }
    const options = (payload.data ?? []).map((item: { id: number; name: string; jobTitle: string }) => ({
      id: item.id,
      name: item.name,
      title: item.jobTitle,
    }));
    setAttachedAdvisors(options);
  }

  async function loadData() {
    const [magazinesResponse, versionsResponse] = await Promise.all([
      fetch("/api/magazines?limit=100"),
      fetch("/api/admin/magazine-versions"),
    ]);
    const magazinesPayload = await readResponseJson(magazinesResponse);
    const versionsPayload = await readResponseJson(versionsResponse);
    if (!magazinesResponse.ok || !versionsResponse.ok) throw new Error("Failed to load dashboard data.");
    setMagazines(magazinesPayload?.data?.items ?? []);
    setVersions(versionsPayload?.data ?? []);
  }

  useEffect(() => {
    (async () => {
      try {
        await loadData();
        const advisorsResponse = await fetch("/api/advisory-members?limit=100");
        const advisorsPayload = await readResponseJson(advisorsResponse);
        if (!advisorsResponse.ok || !advisorsPayload?.success) throw new Error("Failed to load advisors");
        setGlobalAdvisors(
          (advisorsPayload?.data?.items ?? []).map((item: { id: number; name: string; title: string }) => ({
            id: item.id,
            name: item.name,
            title: item.title,
          })),
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load data");
      }
    })();
  }, []);

  async function uploadBannerAndGetUrl(targetMagazineId?: number) {
    if (!bannerFile) return null;
    const presignRes = await fetch("/api/admin/magazine-banner-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        magazineId: targetMagazineId,
        filename: bannerFile.name,
        contentType: bannerFile.type,
        size: bannerFile.size,
      }),
    });
    const presignPayload = await readResponseJson(presignRes);
    if (!presignRes.ok || !presignPayload?.success) {
      throw new Error(presignPayload?.error ?? "Could not start banner upload");
    }
    const { uploadUrl, fileUrl } = presignPayload.data as { uploadUrl: string; fileUrl: string };
    const putRes = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": bannerFile.type }, body: bannerFile });
    if (!putRes.ok) throw new Error("Could not upload banner file");
    return fileUrl;
  }

  async function uploadPdfAndGetUrl() {
    if (!pdfFile) return null;
    const presignRes = await fetch("/api/pdfs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: pdfFile.name,
        contentType: pdfFile.type,
        size: pdfFile.size,
      }),
    });
    const presignPayload = await readResponseJson(presignRes);
    if (!presignRes.ok || !presignPayload?.success) {
      throw new Error(presignPayload?.error ?? "Could not start PDF upload");
    }
    const { uploadUrl, fileUrl } = presignPayload.data as { uploadUrl: string; fileUrl: string };
    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": pdfFile.type },
      body: pdfFile,
    });
    if (!putRes.ok) throw new Error("Could not upload PDF file");
    return fileUrl;
  }

  async function submitMagazine(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (!magForm.image.trim() && !bannerFile) {
        throw new Error("Banner image URL is required, or upload a banner file.");
      }
      const bannerUrl = await uploadBannerAndGetUrl(editingId ?? undefined);
      const uploadedPdfUrl = await uploadPdfAndGetUrl();
      const payload = normalizeMagazinePayload({
        ...magForm,
        image: bannerUrl ?? magForm.image,
        pdfUrl: uploadedPdfUrl ?? magForm.pdfUrl,
      });
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/magazines/${editingId}` : "/api/magazines";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responsePayload = await readResponseJson(response);
      if (!response.ok || !responsePayload?.success) throw new Error(responsePayload?.error ?? "Save failed");
      setMagForm(emptyMagazineForm);
      setEditingId(null);
      setBannerFile(null);
      setPdfFile(null);
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save magazine");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(magazine: Magazine) {
    const approvedAdvisorIds =
      magazine.approvedAdvisors?.map((entry) => entry.advisoryMemberId) ?? [];
    setEditingId(magazine.id);
    setMagForm({
      title: magazine.title,
      description: magazine.description,
      image: magazine.image,
      category: magazine.category,
      pdfUrl: magazine.pdfUrl ?? "",
      issn: magazine.issn ?? "",
      impactFactor: magazine.impactFactor != null ? String(magazine.impactFactor) : "",
      currentVersion: magazine.currentVersion ?? "",
      nextVersionRelease: toDateInput(magazine.nextVersionRelease),
      publicationPreference: magazine.publicationPreference ?? "",
      versionMessage: magazine.versionMessage ?? "",
      certification: magazine.certification ?? "",
      approvedAdvisorIds,
    });
    setPdfFile(null);
    loadAttachedAdvisors(magazine.id).catch(() => {
      setAttachedAdvisors([]);
    });
  }

  async function removeMagazine(id: number) {
    if (!confirm("Delete this magazine?")) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/magazines/${id}`, { method: "DELETE" });
      const payload = await readResponseJson(response);
      if (!response.ok || !payload?.success) throw new Error(payload?.error ?? "Delete failed");
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  async function submitVersion(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = normalizeVersionPayload(versionForm);
      const response = await fetch(
        versionForm.id ? `/api/admin/magazine-versions/${versionForm.id}` : "/api/admin/magazine-versions",
        {
          method: versionForm.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const resPayload = await readResponseJson(response);
      if (!response.ok || !resPayload?.success) throw new Error(resPayload?.error ?? "Version save failed");
      setVersionForm(emptyVersionForm);
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Version save failed");
    } finally {
      setBusy(false);
    }
  }

  async function deleteVersion(id: number) {
    if (!confirm("Delete this version?")) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/magazine-versions/${id}`, { method: "DELETE" });
      const payload = await readResponseJson(response);
      if (!response.ok || !payload?.success) throw new Error(payload?.error ?? "Delete failed");
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Version delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>Magazines Dashboard</h1>
        <p className={styles.adminSubtitle}>Create, edit, and delete magazines with versions and advisor links.</p>
      </header>
      <section className={styles.adminStatusGrid} aria-label="Magazines overview">
        <div className={styles.adminStatusCard}>
          <p className={styles.adminStatusLabel}>Total magazines</p>
          <p className={styles.adminStatusValue}>{magazines.length}</p>
        </div>
        <div className={styles.adminStatusCard}>
          <p className={styles.adminStatusLabel}>Total versions</p>
          <p className={styles.adminStatusValue}>{versions.length}</p>
        </div>
        <div className={styles.adminStatusCard}>
          <p className={styles.adminStatusLabel}>Advisor options</p>
          <p className={styles.adminStatusValue}>{advisorOptions.length}</p>
        </div>
      </section>

      <section className={styles.adminSection}>
        <div className={styles.adminSectionHeader}>
          <SectionIcon kind="edit" />
          <h3 className={styles.adminSectionTitle}>{editingId ? `Edit magazine #${editingId}` : "Create new magazine"}</h3>
        </div>
        <form className={styles.adminForm} onSubmit={submitMagazine}>
          <input className={styles.adminInput} placeholder="Magazine name" value={magForm.title} onChange={(e) => setMagForm((s) => ({ ...s, title: e.target.value }))} required />
          <textarea className={styles.adminTextarea} placeholder="Description" value={magForm.description} onChange={(e) => setMagForm((s) => ({ ...s, description: e.target.value }))} required />
          <input className={styles.adminInput} placeholder="Category" value={magForm.category} onChange={(e) => setMagForm((s) => ({ ...s, category: e.target.value }))} required />
          <input className={styles.adminInput} placeholder="Banner image URL" value={magForm.image} onChange={(e) => setMagForm((s) => ({ ...s, image: e.target.value }))} required />
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)} />
          <input className={styles.adminInput} placeholder="ISSN" value={magForm.issn} onChange={(e) => setMagForm((s) => ({ ...s, issn: e.target.value }))} />
          <input className={styles.adminInput} placeholder="Impact factor" value={magForm.impactFactor} onChange={(e) => setMagForm((s) => ({ ...s, impactFactor: e.target.value }))} />
          <input className={styles.adminInput} placeholder="Current version" value={magForm.currentVersion} onChange={(e) => setMagForm((s) => ({ ...s, currentVersion: e.target.value }))} />
          <input type="date" className={styles.adminInput} value={magForm.nextVersionRelease} onChange={(e) => setMagForm((s) => ({ ...s, nextVersionRelease: e.target.value }))} />
          <input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)} />
          {pdfFile ? (
            <p className={styles.adminSubtitle}>Selected PDF: {pdfFile.name}</p>
          ) : magForm.pdfUrl ? (
            <p className={styles.adminSubtitle}>
              Current PDF:{" "}
              <a href={magForm.pdfUrl} target="_blank" rel="noreferrer">
                Open file
              </a>
            </p>
          ) : (
            <p className={styles.adminSubtitle}>No PDF uploaded yet.</p>
          )}
          <textarea className={styles.adminTextarea} placeholder="Publication preference" value={magForm.publicationPreference} onChange={(e) => setMagForm((s) => ({ ...s, publicationPreference: e.target.value }))} />
          <textarea className={styles.adminTextarea} placeholder="Version message" value={magForm.versionMessage} onChange={(e) => setMagForm((s) => ({ ...s, versionMessage: e.target.value }))} />
          <textarea className={styles.adminTextarea} placeholder="Certification" value={magForm.certification} onChange={(e) => setMagForm((s) => ({ ...s, certification: e.target.value }))} />
          <select
            className={styles.adminInput}
            value={advisorSource}
            onChange={(e) => setAdvisorSource(e.target.value as "global" | "attached" | "both")}
          >
            <option value="global">Global advisors</option>
            <option value="attached" disabled={!editingId}>
              Attached advisors {editingId ? "" : "(available while editing)"}
            </option>
            <option value="both">Both sources</option>
          </select>
          <div className={styles.adminSection}>
            <div className={styles.adminSectionHeader}>
              <SectionIcon kind="list" />
              <h4 className={styles.adminSectionTitle}>Approved advisors</h4>
            </div>
            {advisorOptions.length === 0 ? (
              <p className={styles.adminEmpty}>
                {editingId
                  ? "No advisors available from selected source."
                  : "No advisors available yet. Add advisors first, then select approvals."}
              </p>
            ) : (
              <ul className={styles.adminList}>
                {advisorOptions.map((advisor) => {
                  const checked = magForm.approvedAdvisorIds.includes(advisor.id);
                  return (
                    <li key={advisor.id} className={styles.adminListItem}>
                      <label className={styles.adminListText}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setMagForm((state) => ({
                              ...state,
                              approvedAdvisorIds: e.target.checked
                                ? Array.from(new Set([...state.approvedAdvisorIds, advisor.id]))
                                : state.approvedAdvisorIds.filter((id) => id !== advisor.id),
                            }))
                          }
                        />{" "}
                        {advisor.name} - {advisor.title}
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
            {editingId && magForm.approvedAdvisorIds.length === 0 && magForm.certification ? (
              <p className={styles.adminEmpty}>No approving advisors selected for this magazine yet.</p>
            ) : null}
          </div>
          {selectedAdvisorSummary.length > 0 ? (
            <p className={styles.adminSubtitle}>
              Selected approvals: {selectedAdvisorSummary.map((advisor) => advisor.name).join(", ")}
            </p>
          ) : null}
          <div className={styles.adminActions}>
            <button className={`${styles.adminButton} ${styles.adminButtonPrimary}`} type="submit" disabled={busy}>
              {busy ? "Saving..." : editingId ? "Update magazine" : "Create magazine"}
            </button>
            {editingId ? (
              <button
                type="button"
                className={styles.adminButton}
                onClick={() => {
                  setEditingId(null);
                  setMagForm(emptyMagazineForm);
                  setBannerFile(null);
                  setPdfFile(null);
                  setAttachedAdvisors([]);
                  setAdvisorSource("both");
                }}
              >
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>
        {error ? <p className={styles.adminError}>{error}</p> : null}
      </section>

      <section className={styles.adminSection}>
        <div className={styles.adminSectionHeader}>
          <SectionIcon kind="list" />
          <h3 className={styles.adminSectionTitle}>Magazines</h3>
        </div>
        <input
          className={styles.adminInput}
          placeholder="Search magazines by name"
          value={magazineSearch}
          onChange={(e) => setMagazineSearch(e.target.value)}
        />
        <ul className={styles.adminList}>
          {filteredMagazines.map((item) => (
            <li key={item.id} className={styles.adminListItem}>
              <span className={styles.adminListText}>
                <strong>{item.title}</strong> - {item.category}
                <br />
                ISSN: {item.issn ?? "-"} | Current: {item.currentVersion ?? "-"}
                <br />
                Approved advisors: {item.approvedAdvisors?.length ?? 0}
              </span>
              <div className={styles.adminActions}>
                <Link href={`/admin/magazines/${item.id}`} className={`${styles.adminButton} ${styles.adminButtonPrimary}`}>Manage advisors</Link>
                <button type="button" className={styles.adminButton} onClick={() => startEdit(item)}>Edit</button>
                <button type="button" className={`${styles.adminButton} ${styles.adminButtonDanger}`} onClick={() => removeMagazine(item.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.adminSection}>
        <div className={styles.adminSectionHeader}>
          <SectionIcon kind="release" />
          <h3 className={styles.adminSectionTitle}>{versionForm.id ? "Edit version" : "Create version"}</h3>
        </div>
        <form className={styles.adminForm} onSubmit={submitVersion}>
          <select className={styles.adminInput} value={versionForm.magazineId} onChange={(e) => setVersionForm((s) => ({ ...s, magazineId: e.target.value }))} required>
            <option value="">Select magazine</option>
            {sortedMagazines.map((m) => (<option key={m.id} value={m.id}>{m.title}</option>))}
          </select>
          <input className={styles.adminInput} placeholder="Version" value={versionForm.version} onChange={(e) => setVersionForm((s) => ({ ...s, version: e.target.value }))} required />
          <input className={styles.adminInput} placeholder="Title" value={versionForm.title} onChange={(e) => setVersionForm((s) => ({ ...s, title: e.target.value }))} required />
          <input type="datetime-local" className={styles.adminInput} value={versionForm.releaseDate} onChange={(e) => setVersionForm((s) => ({ ...s, releaseDate: e.target.value }))} required />
          <input className={styles.adminInput} placeholder="Page count" value={versionForm.pageCount} onChange={(e) => setVersionForm((s) => ({ ...s, pageCount: e.target.value }))} />
          <input className={styles.adminInput} placeholder="PDF URL" value={versionForm.pdfUrl} onChange={(e) => setVersionForm((s) => ({ ...s, pdfUrl: e.target.value }))} />
          <textarea className={styles.adminTextarea} placeholder="Notes" value={versionForm.notes} onChange={(e) => setVersionForm((s) => ({ ...s, notes: e.target.value }))} />
          <div className={styles.adminActions}>
            <button className={`${styles.adminButton} ${styles.adminButtonPrimary}`} type="submit" disabled={busy}>
              {versionForm.id ? "Update version" : "Create version"}
            </button>
            {versionForm.id ? <button type="button" className={styles.adminButton} onClick={() => setVersionForm(emptyVersionForm)}>Cancel</button> : null}
          </div>
        </form>
      </section>

      <section className={styles.adminSection}>
        <div className={styles.adminSectionHeader}>
          <SectionIcon kind="versions" />
          <h3 className={styles.adminSectionTitle}>Versions</h3>
        </div>
        <input
          className={styles.adminInput}
          placeholder="Search versions by magazine name or version number"
          value={versionSearch}
          onChange={(e) => setVersionSearch(e.target.value)}
        />
        <ul className={styles.adminList}>
          {filteredVersions.map((item) => (
            <li key={item.id} className={styles.adminListItem}>
              <span className={styles.adminListText}>
                <strong>{item.magazine?.title ?? `Magazine #${item.magazineId}`}</strong> - v{item.version}
                <br />
                {new Date(item.releaseDate).toLocaleString()}
              </span>
              <div className={styles.adminActions}>
                <button type="button" className={styles.adminButton} onClick={() => setVersionForm({
                  id: item.id,
                  magazineId: String(item.magazineId),
                  version: item.version,
                  title: item.title,
                  releaseDate: new Date(item.releaseDate).toISOString().slice(0, 16),
                  notes: item.notes ?? "",
                  pageCount: item.pageCount != null ? String(item.pageCount) : "",
                  pdfUrl: item.pdfUrl ?? "",
                })}>Edit</button>
                <button type="button" className={`${styles.adminButton} ${styles.adminButtonDanger}`} onClick={() => deleteVersion(item.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
