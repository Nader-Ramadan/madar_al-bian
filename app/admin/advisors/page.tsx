"use client";

import { FormEvent, useEffect, useState } from "react";
import styles from "@/app/page.module.css";

type Advisor = { id: number; name: string; title: string; image: string | null; bio: string | null };

const initialForm = { name: "", title: "", image: "", bio: "" };

export default function AdminAdvisorsPage() {
  const [items, setItems] = useState<Advisor[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function readResponseJson(response: Response) {
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text) as any;
    } catch {
      return null;
    }
  }

  async function load() {
    const response = await fetch("/api/advisory-members?limit=100");
    const payload = await readResponseJson(response);
    if (!response.ok || !payload?.success) throw new Error(payload?.error ?? "Load failed");
    setItems(payload?.data?.items ?? []);
  }

  async function uploadPhotoAndGetUrl() {
    if (!photoFile) return form.image.trim() || null;

    const presignResponse = await fetch("/api/admin/advisory-member-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: photoFile.name,
        contentType: photoFile.type || "image/jpeg",
        size: photoFile.size,
      }),
    });
    const presignPayload = await readResponseJson(presignResponse);
    if (!presignResponse.ok || !presignPayload?.success) {
      throw new Error(presignPayload?.error ?? "Failed to prepare photo upload");
    }

    const { uploadUrl, fileUrl } = presignPayload.data ?? {};
    if (!uploadUrl || !fileUrl) throw new Error("Upload URL is missing");

    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": photoFile.type || "application/octet-stream" },
      body: photoFile,
    });
    if (!uploadResponse.ok) throw new Error("Photo upload failed");
    return fileUrl as string;
  }

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const imageUrl = await uploadPhotoAndGetUrl();
      const response = await fetch(editingId ? `/api/advisory-members/${editingId}` : "/api/advisory-members", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          title: form.title.trim(),
          image: imageUrl,
          bio: form.bio.trim() || null,
        }),
      });
      const payload = await readResponseJson(response);
      if (!response.ok || !payload?.success) throw new Error(payload?.error ?? "Save failed");
      setForm(initialForm);
      setPhotoFile(null);
      setEditingId(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this advisor?")) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/advisory-members/${id}`, { method: "DELETE" });
      const payload = await readResponseJson(response);
      if (!response.ok || !payload?.success) throw new Error(payload?.error ?? "Delete failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>Advisors Management</h1>
        <p className={styles.adminSubtitle}>Create, edit, and remove advisors.</p>
      </header>
      <section className={styles.adminSection}>
        <h3 className={styles.adminSectionTitle}>{editingId ? "Edit advisor" : "Add advisor"}</h3>
        <form className={styles.adminForm} onSubmit={submit}>
          <input className={styles.adminInput} placeholder="Name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required />
          <input className={styles.adminInput} placeholder="Title" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} required />
          <input
            className={styles.adminInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
          />
          {photoFile ? <p className={styles.adminHint}>Selected photo: {photoFile.name}</p> : null}
          {!photoFile && form.image ? (
            <p className={styles.adminHint}>
              Current photo:{" "}
              <a href={form.image} target="_blank" rel="noreferrer">
                Open image
              </a>
            </p>
          ) : null}
          {!photoFile && !form.image ? <p className={styles.adminHint}>No photo uploaded yet.</p> : null}
          <textarea className={styles.adminTextarea} placeholder="Bio (optional)" value={form.bio} onChange={(e) => setForm((s) => ({ ...s, bio: e.target.value }))} />
          <div className={styles.adminActions}>
            <button className={`${styles.adminButton} ${styles.adminButtonPrimary}`} disabled={busy} type="submit">{editingId ? "Update" : "Create"}</button>
            {editingId ? <button type="button" className={styles.adminButton} onClick={() => { setEditingId(null); setForm(initialForm); setPhotoFile(null); }}>Cancel</button> : null}
          </div>
        </form>
        {error ? <p className={styles.adminError}>{error}</p> : null}
      </section>
      <section className={styles.adminSection}>
        <ul className={styles.adminList}>
          {items.map((item) => (
            <li key={item.id} className={styles.adminListItem}>
              <span className={styles.adminListText}><strong>{item.name}</strong><br />{item.title}</span>
              <div className={styles.adminActions}>
                <button type="button" className={styles.adminButton} onClick={() => { setEditingId(item.id); setPhotoFile(null); setForm({ name: item.name, title: item.title, image: item.image ?? "", bio: item.bio ?? "" }); }}>Edit</button>
                <button type="button" className={`${styles.adminButton} ${styles.adminButtonDanger}`} onClick={() => remove(item.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
