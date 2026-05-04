"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import styles from "@/app/page.module.css";

type Magazine = {
  id: number;
  title: string;
};

type Advisor = {
  id: number;
  photoUrl: string;
  name: string;
  jobTitle: string;
};

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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
      await loadAdvisors();
    })();
  }, [magazineId, loadAdvisors]);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!magazineId) return;
    if (!file) {
      setSubmitError("Choose a photo file.");
      return;
    }
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setSubmitError("Use JPEG, PNG, or WebP.");
      return;
    }

    setBusy(true);
    try {
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
        setSubmitError(presignPayload?.error ?? "Could not start upload");
        return;
      }
      const { uploadUrl, fileUrl } = presignPayload.data as { uploadUrl: string; fileUrl: string };

      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!putRes.ok) {
        setSubmitError("Upload to storage failed.");
        return;
      }

      const createRes = await fetch(`/api/admin/magazines/${magazineId}/advisors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          jobTitle: jobTitle.trim(),
          photoUrl: fileUrl,
        }),
      });
      const createPayload = await createRes.json();
      if (!createRes.ok || !createPayload?.success) {
        setSubmitError(createPayload?.error ?? "Could not save advisor");
        return;
      }

      setName("");
      setJobTitle("");
      setFile(null);
      setFileInputKey((k) => k + 1);
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
          <Link href="/admin/magazines">← Magazines</Link>
        </div>
        <h1 className={styles.adminTitle}>Publishing advisors (لجنة التحكيم)</h1>
        <p className={styles.adminSubtitle}>
          {magazine ? magazine.title : loadError ? loadError : "Loading…"}
        </p>
      </header>

      {loadError && !magazine ? (
        <p className={styles.adminError}>{loadError}</p>
      ) : (
        <>
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
            <h3 className={styles.adminSectionTitle}>Add advisor</h3>
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
                key={fileInputKey}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {submitError ? <p className={styles.adminError}>{submitError}</p> : null}
              <button
                type="submit"
                className={`${styles.adminButton} ${styles.adminButtonPrimary}`}
                disabled={busy}
              >
                {busy ? "Working…" : "Add advisor"}
              </button>
            </form>
          </section>
        </>
      )}
    </div>
  );
}
