"use client";

import Link from "next/link";
import MagazineResearchEditor from "@/app/admin/components/magazine-research-editor";
import { uploadBannerFileToStorage, uploadPdfFileToStorage } from "@/lib/admin-client-upload";
import { adminCopy } from "@/lib/admin/ar-copy";
import { translateAdminApiMessage } from "@/lib/admin/api-error-ar";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import styles from "@/app/page.module.css";

const ac = adminCopy.magazines;
const c = adminCopy.common;

type Magazine = {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  language: "AR" | "EN";
  pdfUrl: string | null;
  issn: string | null;
  impactFactor: number | null;
  currentVersion: string | null;
  nextVersionRelease: string | null;
  publicationPreference: string | null;
  versionMessage: string | null;
  certification: string | null;
  contactPhone: string | null;
  contactPhoneTel: string | null;
  contactEmail: string | null;
  contactAddress: string | null;
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
  language: "AR" | "EN";
  pdfUrl: string;
  issn: string;
  impactFactor: string;
  currentVersion: string;
  nextVersionRelease: string;
  publicationPreference: string;
  versionMessage: string;
  certification: string;
  contactPhone: string;
  contactPhoneTel: string;
  contactEmail: string;
  contactAddress: string;
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
  language: "AR",
  pdfUrl: "",
  issn: "",
  impactFactor: "",
  currentVersion: "",
  nextVersionRelease: "",
  publicationPreference: "",
  versionMessage: "",
  certification: "",
  contactPhone: "",
  contactPhoneTel: "",
  contactEmail: "",
  contactAddress: "",
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
    language: form.language,
    pdfUrl: form.pdfUrl.trim() || null,
    issn: form.issn.trim() || null,
    impactFactor: form.impactFactor.trim() ? Number(form.impactFactor) : null,
    currentVersion: form.currentVersion.trim() || null,
    nextVersionRelease: form.nextVersionRelease ? new Date(form.nextVersionRelease) : null,
    publicationPreference: form.publicationPreference.trim() || null,
    versionMessage: form.versionMessage.trim() || null,
    certification: form.certification.trim() || null,
    contactPhone: form.contactPhone.trim() || null,
    contactPhoneTel: form.contactPhoneTel.trim() || null,
    contactEmail: form.contactEmail.trim() || null,
    contactAddress: form.contactAddress.trim() || null,
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

function formatApiFailureMessage(
  response: Response,
  payload: { success?: boolean; error?: string; details?: unknown } | null,
  fallback: string,
): string {
  const base = (payload && typeof payload === "object" && typeof payload.error === "string" && payload.error.trim())
    ? payload.error.trim()
    : fallback;
  const details = payload?.details;
  if (details != null && typeof details === "object") {
    try {
      const snippet = JSON.stringify(details).slice(0, 400);
      return translateAdminApiMessage(`${base} (${response.status}) ${snippet}`);
    } catch {
      return translateAdminApiMessage(`${base} (${response.status})`);
    }
  }
  return translateAdminApiMessage(`${base} (${response.status})`);
}

type AdminMagazinesTab = "magazines" | "researches";

export default function AdminMagazinesDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [adminTab, setAdminTab] = useState<AdminMagazinesTab>("magazines");
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
  const [versionPdfFile, setVersionPdfFile] = useState<File | null>(null);
  const [versionPdfInputKey, setVersionPdfInputKey] = useState(0);
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

  useEffect(() => {
    const tab = searchParams.get("tab");
    setAdminTab(tab === "researches" ? "researches" : "magazines");
  }, [searchParams]);

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
    if (!magazinesResponse.ok || !versionsResponse.ok) {
      const parts: string[] = [];
      if (!magazinesResponse.ok) {
        const err =
          (magazinesPayload as { error?: string } | null)?.error ??
          `HTTP ${magazinesResponse.status}`;
        parts.push(`المجلات (${magazinesResponse.status}): ${translateAdminApiMessage(err)}`);
      }
      if (!versionsResponse.ok) {
        const err =
          (versionsPayload as { error?: string } | null)?.error ??
          `HTTP ${versionsResponse.status}`;
        parts.push(`الإصدارات (${versionsResponse.status}): ${translateAdminApiMessage(err)}`);
      }
      throw new Error(`تعذر تحميل بيانات لوحة المجلات. ${parts.join(" · ")}`);
    }
    setMagazines(magazinesPayload?.data?.items ?? []);
    setVersions(versionsPayload?.data ?? []);
  }

  useEffect(() => {
    (async () => {
      try {
        await loadData();
        const advisorsResponse = await fetch("/api/advisory-members?limit=100");
        const advisorsPayload = await readResponseJson(advisorsResponse);
        if (!advisorsResponse.ok || !advisorsPayload?.success) throw new Error("تعذر تحميل قائمة المستشارين.");
        setGlobalAdvisors(
          (advisorsPayload?.data?.items ?? []).map((item: { id: number; name: string; title: string }) => ({
            id: item.id,
            name: item.name,
            title: item.title,
          })),
        );
      } catch (e) {
        setError(translateAdminApiMessage(e instanceof Error ? e.message : c.loading));
      }
    })();
  }, []);

  async function uploadBannerAndGetUrl(targetMagazineId?: number) {
    if (!bannerFile) return null;
    return uploadBannerFileToStorage(bannerFile, targetMagazineId);
  }

  async function uploadPdfAndGetUrl() {
    if (!pdfFile) return null;
    return uploadPdfFileToStorage(pdfFile);
  }

  async function uploadVersionPdfAndGetUrl() {
    if (!versionPdfFile) return null;
    return uploadPdfFileToStorage(versionPdfFile);
  }

  async function submitMagazine(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (!editingId && !bannerFile) {
        throw new Error(translateAdminApiMessage("Upload a banner image (JPEG, PNG, or WebP)."));
      }
      if (editingId && !magForm.image.trim() && !bannerFile) {
        throw new Error(
          translateAdminApiMessage(
            "Upload a new banner or keep the existing one (re-open edit from the list).",
          ),
        );
      }
      const bannerUrl = await uploadBannerAndGetUrl(editingId ?? undefined);
      const uploadedPdfUrl = await uploadPdfAndGetUrl();
      const payload = normalizeMagazinePayload({
        ...magForm,
        image: bannerUrl ?? magForm.image,
        pdfUrl: uploadedPdfUrl ?? magForm.pdfUrl,
      });
      // #region agent log
      fetch("http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "51cdae" },
        body: JSON.stringify({
          sessionId: "51cdae",
          location: "magazines-dashboard.client.tsx:submitMagazine",
          message: "Saving magazine with approved advisors",
          data: {
            editingId,
            approvedAdvisorIds: payload.approvedAdvisorIds,
            advisorSource,
            attachedAdvisorIds: attachedAdvisors.map((a) => a.id),
            globalAdvisorIds: globalAdvisors.map((a) => a.id),
          },
          timestamp: Date.now(),
          hypothesisId: "D",
        }),
      }).catch(() => {});
      // #endregion
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/magazines/${editingId}` : "/api/magazines";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responsePayload = await readResponseJson(response);
      if (!response.ok || !responsePayload?.success) {
        throw new Error(formatApiFailureMessage(response, responsePayload, translateAdminApiMessage("Save failed")));
      }
      setMagForm(emptyMagazineForm);
      setEditingId(null);
      setBannerFile(null);
      setPdfFile(null);
      await loadData();
    } catch (e) {
      setError(translateAdminApiMessage(e instanceof Error ? e.message : "Could not save magazine"));
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
      language: magazine.language === "EN" ? "EN" : "AR",
      pdfUrl: magazine.pdfUrl ?? "",
      issn: magazine.issn ?? "",
      impactFactor: magazine.impactFactor != null ? String(magazine.impactFactor) : "",
      currentVersion: magazine.currentVersion ?? "",
      nextVersionRelease: toDateInput(magazine.nextVersionRelease),
      publicationPreference: magazine.publicationPreference ?? "",
      versionMessage: magazine.versionMessage ?? "",
      certification: magazine.certification ?? "",
      contactPhone: magazine.contactPhone ?? "",
      contactPhoneTel: magazine.contactPhoneTel ?? "",
      contactEmail: magazine.contactEmail ?? "",
      contactAddress: magazine.contactAddress ?? "",
      approvedAdvisorIds,
    });
    setPdfFile(null);
    loadAttachedAdvisors(magazine.id).catch(() => {
      setAttachedAdvisors([]);
    });
  }

  async function removeMagazine(id: number) {
    if (!confirm(ac.confirmDeleteMagazine)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/magazines/${id}`, { method: "DELETE" });
      const payload = await readResponseJson(response);
      if (!response.ok || !payload?.success)
        throw new Error(translateAdminApiMessage(payload?.error ?? "Delete failed"));
      await loadData();
    } catch (e) {
      setError(translateAdminApiMessage(e instanceof Error ? e.message : "Delete failed"));
    } finally {
      setBusy(false);
    }
  }

  async function submitVersion(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const uploadedVersionPdf = await uploadVersionPdfAndGetUrl();
      const payload = normalizeVersionPayload({
        ...versionForm,
        pdfUrl: uploadedVersionPdf ?? (versionForm.pdfUrl.trim() || ""),
      });
      const response = await fetch(
        versionForm.id ? `/api/admin/magazine-versions/${versionForm.id}` : "/api/admin/magazine-versions",
        {
          method: versionForm.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const resPayload = await readResponseJson(response);
      if (!response.ok || !resPayload?.success)
        throw new Error(translateAdminApiMessage(resPayload?.error ?? "Version save failed"));
      setVersionForm(emptyVersionForm);
      setVersionPdfFile(null);
      setVersionPdfInputKey((k) => k + 1);
      await loadData();
    } catch (e) {
      setError(translateAdminApiMessage(e instanceof Error ? e.message : "Version save failed"));
    } finally {
      setBusy(false);
    }
  }

  async function deleteVersion(id: number) {
    if (!confirm(ac.confirmDeleteVersion)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/magazine-versions/${id}`, { method: "DELETE" });
      const payload = await readResponseJson(response);
      if (!response.ok || !payload?.success)
        throw new Error(translateAdminApiMessage(payload?.error ?? "Delete failed"));
      await loadData();
    } catch (e) {
      setError(translateAdminApiMessage(e instanceof Error ? e.message : "Delete failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>{ac.title}</h1>
        <p className={styles.adminSectionExplainer}>{ac.explainer}</p>
      </header>
      <section className={styles.adminStatusGrid} aria-label={ac.overviewAria}>
        <div className={styles.adminStatusCard}>
          <p className={styles.adminStatusLabel}>{ac.totalMagazines}</p>
          <p className={styles.adminStatusValue}>{magazines.length}</p>
        </div>
        <div className={styles.adminStatusCard}>
          <p className={styles.adminStatusLabel}>{ac.totalVersions}</p>
          <p className={styles.adminStatusValue}>{versions.length}</p>
        </div>
        <div className={styles.adminStatusCard}>
          <p className={styles.adminStatusLabel}>{ac.advisorOptions}</p>
          <p className={styles.adminStatusValue}>{advisorOptions.length}</p>
        </div>
      </section>

      <div className={styles.adminTabRow} role="tablist" aria-label={ac.tablistAria}>
        <button
          type="button"
          role="tab"
          aria-selected={adminTab === "magazines"}
          className={`${styles.adminTabButton} ${adminTab === "magazines" ? styles.adminTabButtonActive : ""}`}
          onClick={() => {
            setAdminTab("magazines");
            router.replace("/admin/magazines", { scroll: false });
          }}
        >
          {ac.tabMagazines}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={adminTab === "researches"}
          className={`${styles.adminTabButton} ${adminTab === "researches" ? styles.adminTabButtonActive : ""}`}
          onClick={() => {
            setAdminTab("researches");
            router.replace("/admin/magazines?tab=researches", { scroll: false });
          }}
        >
          {ac.tabResearches}
        </button>
      </div>

      {adminTab === "magazines" ? (
        <>
      <section className={styles.adminSection}>
        <div className={styles.adminSectionHeader}>
          <SectionIcon kind="edit" />
          <h3 className={styles.adminSectionTitle}>
            {editingId ? ac.editMagazine(editingId) : ac.createMagazine}
          </h3>
        </div>
        <p className={styles.adminSectionExplainer}>{ac.sectionCreateMagazineExplainer}</p>
        <form className={styles.adminForm} onSubmit={submitMagazine}>
          <input className={styles.adminInput} placeholder={ac.placeholderTitle} value={magForm.title} onChange={(e) => setMagForm((s) => ({ ...s, title: e.target.value }))} required />
          <textarea className={styles.adminTextarea} placeholder={ac.placeholderDescription} value={magForm.description} onChange={(e) => setMagForm((s) => ({ ...s, description: e.target.value }))} required />
          <input className={styles.adminInput} placeholder={ac.placeholderCategory} value={magForm.category} onChange={(e) => setMagForm((s) => ({ ...s, category: e.target.value }))} required />
          <label className={styles.adminSubtitle}>
            {ac.languageLabel}
            <select
              className={styles.adminInput}
              value={magForm.language}
              onChange={(e) => setMagForm((s) => ({ ...s, language: e.target.value as "AR" | "EN" }))}
            >
              <option value="AR">{ac.languageAr}</option>
              <option value="EN">{ac.languageEn}</option>
            </select>
          </label>
          <p className={styles.adminSubtitle}>
            {editingId && magForm.image.trim() ? (
              <>
                {ac.bannerCurrent}{" "}
                <a href={magForm.image} target="_blank" rel="noreferrer">
                  {c.openImage}
                </a>
              </>
            ) : editingId ? (
              ac.bannerNoneEdit
            ) : (
              ac.bannerRequiredNew
            )}
          </p>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)} />
          {bannerFile ? (
            <p className={styles.adminHint}>
              {c.selectedFile} {bannerFile.name}
            </p>
          ) : null}
          <input className={styles.adminInput} placeholder={ac.placeholderIssn} value={magForm.issn} onChange={(e) => setMagForm((s) => ({ ...s, issn: e.target.value }))} />
          <input className={styles.adminInput} placeholder={ac.placeholderImpact} value={magForm.impactFactor} onChange={(e) => setMagForm((s) => ({ ...s, impactFactor: e.target.value }))} />
          <input className={styles.adminInput} placeholder={ac.placeholderCurrentVersion} value={magForm.currentVersion} onChange={(e) => setMagForm((s) => ({ ...s, currentVersion: e.target.value }))} />
          <input type="date" className={styles.adminInput} value={magForm.nextVersionRelease} onChange={(e) => setMagForm((s) => ({ ...s, nextVersionRelease: e.target.value }))} />
          <input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)} />
          {pdfFile ? (
            <p className={styles.adminSubtitle}>
              {ac.pdfSelected} {pdfFile.name}
            </p>
          ) : magForm.pdfUrl ? (
            <p className={styles.adminSubtitle}>
              {ac.pdfCurrent}{" "}
              <a href={magForm.pdfUrl} target="_blank" rel="noreferrer">
                {c.openFile}
              </a>
            </p>
          ) : (
            <p className={styles.adminSubtitle}>{ac.pdfNone}</p>
          )}
          <textarea className={styles.adminTextarea} placeholder={ac.placeholderPublicationPref} value={magForm.publicationPreference} onChange={(e) => setMagForm((s) => ({ ...s, publicationPreference: e.target.value }))} />
          <textarea className={styles.adminTextarea} placeholder={ac.placeholderVersionMessage} value={magForm.versionMessage} onChange={(e) => setMagForm((s) => ({ ...s, versionMessage: e.target.value }))} />
          <textarea className={styles.adminTextarea} placeholder={ac.placeholderCertification} value={magForm.certification} onChange={(e) => setMagForm((s) => ({ ...s, certification: e.target.value }))} />
          <div className={styles.adminSection}>
            <div className={styles.adminSectionHeader}>
              <SectionIcon kind="list" />
              <h4 className={styles.adminSectionTitle}>{ac.contactSectionTitle}</h4>
            </div>
            <p className={styles.adminSectionExplainer}>{ac.contactSectionExplainer}</p>
            <input
              className={styles.adminInput}
              placeholder={ac.placeholderContactPhone}
              value={magForm.contactPhone}
              onChange={(e) => setMagForm((s) => ({ ...s, contactPhone: e.target.value }))}
            />
            <input
              className={styles.adminInput}
              placeholder={ac.placeholderContactPhoneTel}
              value={magForm.contactPhoneTel}
              onChange={(e) => setMagForm((s) => ({ ...s, contactPhoneTel: e.target.value }))}
            />
            <input
              type="email"
              className={styles.adminInput}
              placeholder={ac.placeholderContactEmail}
              value={magForm.contactEmail}
              onChange={(e) => setMagForm((s) => ({ ...s, contactEmail: e.target.value }))}
            />
            <textarea
              className={styles.adminTextarea}
              placeholder={ac.placeholderContactAddress}
              value={magForm.contactAddress}
              onChange={(e) => setMagForm((s) => ({ ...s, contactAddress: e.target.value }))}
            />
          </div>
          <select
            className={styles.adminInput}
            value={advisorSource}
            onChange={(e) => setAdvisorSource(e.target.value as "global" | "attached" | "both")}
          >
            <option value="global">{ac.advisorSourceGlobal}</option>
            <option value="attached" disabled={!editingId}>
              {ac.advisorSourceAttached} {editingId ? "" : ac.advisorSourceAttachedDisabled}
            </option>
            <option value="both">{ac.advisorSourceBoth}</option>
          </select>
          <div className={styles.adminSection}>
            <div className={styles.adminSectionHeader}>
              <SectionIcon kind="list" />
              <h4 className={styles.adminSectionTitle}>{ac.approvedAdvisorsTitle}</h4>
            </div>
            <p className={styles.adminSectionExplainer}>{ac.sectionApprovedAdvisorsExplainer}</p>
            {advisorOptions.length === 0 ? (
              <p className={styles.adminEmpty}>{editingId ? ac.noAdvisorsEditing : ac.noAdvisorsNew}</p>
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
                        {advisor.name} — {advisor.title}
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
            {editingId && magForm.approvedAdvisorIds.length === 0 && magForm.certification ? (
              <p className={styles.adminEmpty}>{ac.noApprovingYet}</p>
            ) : null}
          </div>
          {selectedAdvisorSummary.length > 0 ? (
            <p className={styles.adminSubtitle}>
              {ac.selectedApprovals} {selectedAdvisorSummary.map((advisor) => advisor.name).join("، ")}
            </p>
          ) : null}
          <div className={styles.adminActions}>
            <button className={`${styles.adminButton} ${styles.adminButtonPrimary}`} type="submit" disabled={busy}>
              {busy ? c.saving : editingId ? ac.submitUpdate : ac.submitCreate}
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
                {ac.cancelEdit}
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className={styles.adminSection}>
        <div className={styles.adminSectionHeader}>
          <SectionIcon kind="list" />
          <h3 className={styles.adminSectionTitle}>{ac.listTitle}</h3>
        </div>
        <p className={styles.adminSectionExplainer}>{ac.sectionListExplainer}</p>
        <input
          className={styles.adminInput}
          placeholder={ac.searchMagazines}
          value={magazineSearch}
          onChange={(e) => setMagazineSearch(e.target.value)}
        />
        <ul className={styles.adminList}>
          {filteredMagazines.map((item) => (
            <li key={item.id} className={styles.adminListItem}>
              <span className={styles.adminListText}>
                <strong>{item.title}</strong> — {item.category}
                <br />
                {ac.listLanguageLabel} {item.language === "EN" ? ac.languageEn : ac.languageAr} | {ac.issnLabel}{" "}
                {item.issn ?? "-"} | {ac.currentLabel} {item.currentVersion ?? "-"}
                <br />
                {ac.approvedCount} {item.approvedAdvisors?.length ?? 0}
              </span>
              <div className={styles.adminActions}>
                <Link href={`/admin/magazines/${item.id}`} className={`${styles.adminButton} ${styles.adminButtonPrimary}`}>
                  {ac.manageAdvisors}
                </Link>
                <Link href={`/admin/magazines/${item.id}/publishing-conditions`} className={styles.adminButton}>
                  {ac.publishingConditions}
                </Link>
                <button type="button" className={styles.adminButton} onClick={() => startEdit(item)}>
                  {c.edit}
                </button>
                <button
                  type="button"
                  className={`${styles.adminButton} ${styles.adminButtonDanger}`}
                  onClick={() => removeMagazine(item.id)}
                >
                  {c.delete}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.adminSection}>
        <div className={styles.adminSectionHeader}>
          <SectionIcon kind="release" />
          <h3 className={styles.adminSectionTitle}>{versionForm.id ? ac.editVersion : ac.createVersion}</h3>
        </div>
        <p className={styles.adminSectionExplainer}>{ac.sectionVersionFormExplainer}</p>
        <form className={styles.adminForm} onSubmit={submitVersion}>
          <select className={styles.adminInput} value={versionForm.magazineId} onChange={(e) => setVersionForm((s) => ({ ...s, magazineId: e.target.value }))} required>
            <option value="">{ac.selectMagazine}</option>
            {sortedMagazines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
          <input className={styles.adminInput} placeholder={ac.placeholderVersionCode} value={versionForm.version} onChange={(e) => setVersionForm((s) => ({ ...s, version: e.target.value }))} required />
          <input className={styles.adminInput} placeholder={ac.placeholderVersionTitle} value={versionForm.title} onChange={(e) => setVersionForm((s) => ({ ...s, title: e.target.value }))} required />
          <input type="datetime-local" className={styles.adminInput} value={versionForm.releaseDate} onChange={(e) => setVersionForm((s) => ({ ...s, releaseDate: e.target.value }))} required />
          <input className={styles.adminInput} placeholder={ac.placeholderPageCount} value={versionForm.pageCount} onChange={(e) => setVersionForm((s) => ({ ...s, pageCount: e.target.value }))} />
          <p className={styles.adminSubtitle}>
            {versionForm.pdfUrl.trim() ? (
              <>
                {ac.versionPdfCurrent}{" "}
                <a href={versionForm.pdfUrl} target="_blank" rel="noreferrer">
                  {c.openPdf}
                </a>
              </>
            ) : (
              ac.versionPdfHint
            )}
          </p>
          <input
            key={versionPdfInputKey}
            type="file"
            accept="application/pdf"
            onChange={(e) => setVersionPdfFile(e.target.files?.[0] ?? null)}
          />
          {versionPdfFile ? (
            <p className={styles.adminHint}>
              {c.selectedFile} {versionPdfFile.name}
            </p>
          ) : null}
          <textarea className={styles.adminTextarea} placeholder={ac.placeholderNotes} value={versionForm.notes} onChange={(e) => setVersionForm((s) => ({ ...s, notes: e.target.value }))} />
          <div className={styles.adminActions}>
            <button className={`${styles.adminButton} ${styles.adminButtonPrimary}`} type="submit" disabled={busy}>
              {versionForm.id ? ac.submitVersionUpdate : ac.submitVersionCreate}
            </button>
            {versionForm.id ? (
              <button
                type="button"
                className={styles.adminButton}
                onClick={() => {
                  setVersionForm(emptyVersionForm);
                  setVersionPdfFile(null);
                  setVersionPdfInputKey((k) => k + 1);
                }}
              >
                {c.cancel}
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className={styles.adminSection}>
        <div className={styles.adminSectionHeader}>
          <SectionIcon kind="versions" />
          <h3 className={styles.adminSectionTitle}>{ac.versionsTitle}</h3>
        </div>
        <p className={styles.adminSectionExplainer}>{ac.sectionVersionsExplainer}</p>
        <input
          className={styles.adminInput}
          placeholder={ac.searchVersions}
          value={versionSearch}
          onChange={(e) => setVersionSearch(e.target.value)}
        />
        <ul className={styles.adminList}>
          {filteredVersions.map((item) => (
            <li key={item.id} className={styles.adminListItem}>
              <span className={styles.adminListText}>
                <strong>{item.magazine?.title ?? ac.magazineFallback(item.magazineId)}</strong> — v{item.version}
                <br />
                {new Date(item.releaseDate).toLocaleString("ar")}
              </span>
              <div className={styles.adminActions}>
                <button
                  type="button"
                  className={`${styles.adminButton} ${styles.adminButtonPrimary}`}
                  onClick={() => {
                    setAdminTab("researches");
                    router.replace(
                      `/admin/magazines?tab=researches&magazineId=${item.magazineId}&versionId=${item.id}`,
                      { scroll: false },
                    );
                  }}
                >
                  {ac.manageResearches}
                </button>
                <button
                  type="button"
                  className={styles.adminButton}
                  onClick={() => {
                    setVersionPdfFile(null);
                    setVersionPdfInputKey((k) => k + 1);
                    setVersionForm({
                      id: item.id,
                      magazineId: String(item.magazineId),
                      version: item.version,
                      title: item.title,
                      releaseDate: new Date(item.releaseDate).toISOString().slice(0, 16),
                      notes: item.notes ?? "",
                      pageCount: item.pageCount != null ? String(item.pageCount) : "",
                      pdfUrl: item.pdfUrl ?? "",
                    });
                  }}
                >
                  {c.edit}
                </button>
                <button type="button" className={`${styles.adminButton} ${styles.adminButtonDanger}`} onClick={() => deleteVersion(item.id)}>
                  {c.delete}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
        </>
      ) : (
        <MagazineResearchEditor />
      )}
      {error ? <p className={styles.adminError}>{error}</p> : null}
    </div>
  );
}
