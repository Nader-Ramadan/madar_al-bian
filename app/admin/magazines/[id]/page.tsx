"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import styles from "@/app/page.module.css";
import { uploadMagazineAdvisorPhotoToStorage } from "@/lib/admin-client-upload";
import { adminCopy } from "@/lib/admin/ar-copy";
import { translateAdminApiMessage } from "@/lib/admin/api-error-ar";

type Magazine = { id: number; title: string };
type Advisor = { id: number; photoUrl: string; name: string; jobTitle: string };
type AdvisoryMember = { id: number; name: string; title: string; image: string; bio: string };

function parseId(raw: string | undefined): number | null {
  if (!raw) return null;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export default function AdminMagazinePublishingAdvisorsPage() {
  const mp = adminCopy.magazineAdvisorsPage;
  const c = adminCopy.common;
  const params = useParams();
  const magazineId = parseId(params.id as string | undefined);

  const [magazine, setMagazine] = useState<Magazine | null>(null);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [advisoryMembers, setAdvisoryMembers] = useState<AdvisoryMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [editingAdvisorId, setEditingAdvisorId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [existingPhotoUrl, setExistingPhotoUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const selectedMember = useMemo(
    () => advisoryMembers.find((m) => String(m.id) === selectedMemberId),
    [advisoryMembers, selectedMemberId],
  );

  const loadAdvisors = useCallback(async () => {
    if (!magazineId) return;
    const res = await fetch(`/api/admin/magazines/${magazineId}/advisors`);
    const payload = await res.json();
    if (!res.ok || !payload?.success) {
      setLoadError(translateAdminApiMessage(payload?.error ?? "Failed to load advisors"));
      return;
    }
    setAdvisors(payload.data ?? []);
    setLoadError(null);
  }, [magazineId]);

  const loadMembers = useCallback(async () => {
    const res = await fetch("/api/advisory-members?limit=100");
    const payload = await res.json();
    if (!res.ok || !payload?.success) return;
    setAdvisoryMembers(payload.data?.items ?? []);
  }, []);

  useEffect(() => {
    if (!magazineId) {
      setLoadError(mp.invalidIdPage);
      return;
    }
    (async () => {
      const mRes = await fetch(`/api/magazines/${magazineId}`);
      const mPayload = await mRes.json();
      if (!mRes.ok || !mPayload?.success) {
        setLoadError(translateAdminApiMessage(mPayload?.error ?? "Magazine not found"));
        return;
      }
      setMagazine({ id: mPayload.data.id, title: mPayload.data.title });
      await Promise.all([loadAdvisors(), loadMembers()]);
    })();
  }, [magazineId, loadAdvisors, loadMembers, mp.invalidIdPage]);

  function resetForm() {
    setName("");
    setJobTitle("");
    setExistingPhotoUrl("");
    setFile(null);
    setEditingAdvisorId(null);
    setSelectedMemberId("");
    setFileInputKey((k) => k + 1);
  }

  async function handleRemove(advisorId: number) {
    if (!magazineId || !confirm(mp.confirmRemove)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/magazines/${magazineId}/advisors/${advisorId}`, {
        method: "DELETE",
      });
      const payload = await res.json();
      if (!res.ok || !payload?.success) {
        alert(translateAdminApiMessage(payload?.error ?? "Delete failed"));
        return;
      }
      await loadAdvisors();
    } finally {
      setBusy(false);
    }
  }

  async function uploadIfNeeded(): Promise<string> {
    if (!magazineId) throw new Error("Invalid magazine");
    if (file) {
      return uploadMagazineAdvisorPhotoToStorage(file, magazineId);
    }
    if (editingAdvisorId && existingPhotoUrl.trim()) {
      return existingPhotoUrl.trim();
    }
    throw new Error("Upload a photo (JPEG, PNG, or WebP).");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!magazineId) return;

    setBusy(true);
    try {
      const finalPhotoUrl = await uploadIfNeeded();
      const payload = {
        name: name.trim(),
        jobTitle: jobTitle.trim(),
        photoUrl: finalPhotoUrl,
      };
      const url = editingAdvisorId
        ? `/api/admin/magazines/${magazineId}/advisors/${editingAdvisorId}`
        : `/api/admin/magazines/${magazineId}/advisors`;
      const method = editingAdvisorId ? "PUT" : "POST";

      const createRes = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const createPayload = await createRes.json();
      if (!createRes.ok || !createPayload?.success) {
        setSubmitError(translateAdminApiMessage(createPayload?.error ?? "Could not save advisor"));
        return;
      }

      resetForm();
      await loadAdvisors();
    } catch (err) {
      setSubmitError(translateAdminApiMessage(err instanceof Error ? err.message : "Could not save advisor"));
    } finally {
      setBusy(false);
    }
  }

  async function addFromAdvisoryList() {
    if (!selectedMember || !magazineId) return;
    setBusy(true);
    try {
      const createRes = await fetch(`/api/admin/magazines/${magazineId}/advisors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedMember.name,
          jobTitle: selectedMember.title,
          photoUrl: selectedMember.image,
        }),
      });
      const payload = await createRes.json();
      if (!createRes.ok || !payload?.success) {
        setSubmitError(translateAdminApiMessage(payload?.error ?? "Could not add selected advisor"));
        return;
      }
      setSelectedMemberId("");
      await loadAdvisors();
    } finally {
      setBusy(false);
    }
  }

  if (!magazineId) {
    return (
      <div className={styles.adminPage}>
        <p className={styles.adminError}>{mp.invalidIdPage}</p>
      </div>
    );
  }

  return (
    <div className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <div className={styles.adminSubtitle}>
          <Link href="/admin/magazines">{c.backToMagazines}</Link>
        </div>
        <h1 className={styles.adminTitle}>{mp.title}</h1>
        <p className={styles.adminSectionExplainer}>{mp.explainer}</p>
        <p className={styles.adminSubtitle}>{magazine ? magazine.title : loadError ? loadError : mp.loadingMagazine}</p>
      </header>

      {loadError && !magazine ? (
        <p className={styles.adminError}>{loadError}</p>
      ) : (
        <>
          <section className={styles.adminSection}>
            <h3 className={styles.adminSectionTitle}>{mp.pickTitle}</h3>
            <p className={styles.adminSectionExplainer}>{mp.sectionPickExplainer}</p>
            <div className={styles.adminForm}>
              <select className={styles.adminInput} value={selectedMemberId} onChange={(e) => setSelectedMemberId(e.target.value)}>
                <option value="">{mp.selectAdvisor}</option>
                {advisoryMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} — {member.title}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={`${styles.adminButton} ${styles.adminButtonPrimary}`}
                disabled={!selectedMemberId || busy}
                onClick={addFromAdvisoryList}
              >
                {mp.addSelected}
              </button>
            </div>
          </section>

          <section className={styles.adminSection}>
            <h3 className={styles.adminSectionTitle}>{mp.currentTitle}</h3>
            <p className={styles.adminSectionExplainer}>{mp.listExplainer}</p>
            {advisors.length === 0 ? (
              <p className={styles.adminEmpty}>{mp.empty}</p>
            ) : (
              <ul className={styles.adminList}>
                {advisors.map((a) => (
                  <li key={a.id} className={styles.adminListItem}>
                    <span className={styles.adminListText}>
                      <strong>{a.name}</strong>
                      <br />
                      <span style={{ fontSize: "0.88rem", color: "#5c6e90" }}>{a.jobTitle}</span>
                    </span>
                    <div className={styles.adminActions}>
                      <button
                        type="button"
                        className={styles.adminButton}
                        disabled={busy}
                        onClick={() => {
                          setEditingAdvisorId(a.id);
                          setName(a.name);
                          setJobTitle(a.jobTitle);
                          setExistingPhotoUrl(a.photoUrl);
                          setFile(null);
                          setFileInputKey((k) => k + 1);
                        }}
                      >
                        {c.edit}
                      </button>
                      <button type="button" className={`${styles.adminButton} ${styles.adminButtonDanger}`} disabled={busy} onClick={() => handleRemove(a.id)}>
                        {c.remove}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.adminSection}>
            <h3 className={styles.adminSectionTitle}>{editingAdvisorId ? mp.editAdvisor : mp.addAdvisor}</h3>
            <p className={styles.adminSectionExplainer}>{mp.formExplainer}</p>
            <form className={styles.adminForm} onSubmit={handleSubmit}>
              <input className={styles.adminInput} placeholder={mp.placeholderName} value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
              <textarea className={styles.adminTextarea} placeholder={mp.placeholderJob} value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required />
              {editingAdvisorId && existingPhotoUrl.trim() ? (
                <p className={styles.adminHint}>
                  {mp.photoHintEdit}{" "}
                  <a href={existingPhotoUrl} target="_blank" rel="noreferrer">
                    {c.openImage}
                  </a>
                  {mp.photoReplaceHint}
                </p>
              ) : !editingAdvisorId ? (
                <p className={styles.adminHint}>{mp.photoRequiredNew}</p>
              ) : (
                <p className={styles.adminHint}>{mp.photoNoneEdit}</p>
              )}
              <input key={fileInputKey} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              {file ? (
                <p className={styles.adminHint}>
                  {c.selectedFile} {file.name}
                </p>
              ) : null}
              {submitError ? <p className={styles.adminError}>{submitError}</p> : null}
              <div className={styles.adminActions}>
                <button type="submit" className={`${styles.adminButton} ${styles.adminButtonPrimary}`} disabled={busy}>
                  {busy ? c.working : editingAdvisorId ? mp.submitUpdateAdvisor : mp.submitAddAdvisor}
                </button>
                {editingAdvisorId ? (
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
