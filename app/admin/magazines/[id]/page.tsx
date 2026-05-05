"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import styles from "@/app/page.module.css";

type Magazine = { id: number; title: string };
type Advisor = { id: number; photoUrl: string; name: string; jobTitle: string };
type AdvisoryMember = { id: number; name: string; title: string; image: string; bio: string };

function parseId(raw: string | undefined): number | null {
  if (!raw) return null;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export default function AdminMagazinePublishingAdvisorsPage() {
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
  const [photoUrl, setPhotoUrl] = useState("");
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
      setLoadError(payload?.error ?? "Failed to load advisors");
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
      setLoadError("Invalid magazine id");
      return;
    }
    (async () => {
      const mRes = await fetch(`/api/magazines/${magazineId}`);
      const mPayload = await mRes.json();
      if (!mRes.ok || !mPayload?.success) {
        setLoadError(mPayload?.error ?? "Magazine not found");
        return;
      }
      setMagazine({ id: mPayload.data.id, title: mPayload.data.title });
      await Promise.all([loadAdvisors(), loadMembers()]);
    })();
  }, [magazineId, loadAdvisors, loadMembers]);

  function resetForm() {
    setName("");
    setJobTitle("");
    setPhotoUrl("");
    setFile(null);
    setEditingAdvisorId(null);
    setSelectedMemberId("");
    setFileInputKey((k) => k + 1);
  }

  async function handleRemove(advisorId: number) {
    if (!magazineId || !confirm("Remove this advisor?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/magazines/${magazineId}/advisors/${advisorId}`, {
        method: "DELETE",
      });
      const payload = await res.json();
      if (!res.ok || !payload?.success) {
        alert(payload?.error ?? "Delete failed");
        return;
      }
      await loadAdvisors();
    } finally {
      setBusy(false);
    }
  }

  async function uploadIfNeeded(): Promise<string> {
    if (!file) return photoUrl.trim();
    if (!magazineId) return "";
    const presignRes = await fetch("/api/admin/magazine-advisor-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        magazineId,
        filename: file.name,
        contentType: file.type,
        size: file.size,
      }),
    });
    const presignPayload = await presignRes.json();
    if (!presignRes.ok || !presignPayload?.success) {
      throw new Error(presignPayload?.error ?? "Could not start upload");
    }
    const { uploadUrl, fileUrl } = presignPayload.data as { uploadUrl: string; fileUrl: string };

    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
    if (!putRes.ok) throw new Error("Upload to storage failed.");
    return fileUrl;
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
        setSubmitError(createPayload?.error ?? "Could not save advisor");
        return;
      }

      resetForm();
      await loadAdvisors();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not save advisor");
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
        setSubmitError(payload?.error ?? "Could not add selected advisor");
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
        <p className={styles.adminError}>Invalid magazine id.</p>
      </div>
    );
  }

  return (
    <div className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <div className={styles.adminSubtitle}>
          <Link href="/admin/magazines">? Magazines</Link>
        </div>
        <h1 className={styles.adminTitle}>Magazine advisors</h1>
        <p className={styles.adminSubtitle}>
          {magazine ? magazine.title : loadError ? loadError : "Loading..."}
        </p>
      </header>

      {loadError && !magazine ? (
        <p className={styles.adminError}>{loadError}</p>
      ) : (
        <>
          <section className={styles.adminSection}>
            <h3 className={styles.adminSectionTitle}>Select from advisors list</h3>
            <div className={styles.adminForm}>
              <select className={styles.adminInput} value={selectedMemberId} onChange={(e) => setSelectedMemberId(e.target.value)}>
                <option value="">Select advisor</option>
                {advisoryMembers.map((member) => (
                  <option key={member.id} value={member.id}>{member.name} - {member.title}</option>
                ))}
              </select>
              <button type="button" className={`${styles.adminButton} ${styles.adminButtonPrimary}`} disabled={!selectedMemberId || busy} onClick={addFromAdvisoryList}>
                Add selected advisor
              </button>
            </div>
          </section>

          <section className={styles.adminSection}>
            <h3 className={styles.adminSectionTitle}>Current advisors</h3>
            {advisors.length === 0 ? (
              <p className={styles.adminEmpty}>No advisors yet.</p>
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
                          setPhotoUrl(a.photoUrl);
                          setFile(null);
                          setFileInputKey((k) => k + 1);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className={`${styles.adminButton} ${styles.adminButtonDanger}`}
                        disabled={busy}
                        onClick={() => handleRemove(a.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.adminSection}>
            <h3 className={styles.adminSectionTitle}>{editingAdvisorId ? "Edit advisor" : "Add advisor"}</h3>
            <form className={styles.adminForm} onSubmit={handleSubmit}>
              <input
                className={styles.adminInput}
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
              />
              <textarea
                className={styles.adminTextarea}
                placeholder="Job title / affiliation"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
              />
              <input
                className={styles.adminInput}
                placeholder="Photo URL"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                required={!file}
              />
              <input
                key={fileInputKey}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {submitError ? <p className={styles.adminError}>{submitError}</p> : null}
              <div className={styles.adminActions}>
                <button
                  type="submit"
                  className={`${styles.adminButton} ${styles.adminButtonPrimary}`}
                  disabled={busy}
                >
                  {busy ? "Working..." : editingAdvisorId ? "Update advisor" : "Add advisor"}
                </button>
                {editingAdvisorId ? (
                  <button type="button" className={styles.adminButton} onClick={resetForm}>
                    Cancel
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
