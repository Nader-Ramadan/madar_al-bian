"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import styles from "@/app/page.module.css";
import { readAdminResponseJson, uploadAdvisoryMemberPhotoToStorage } from "@/lib/admin-client-upload";
import { adminCopy } from "@/lib/admin/ar-copy";
import { translateAdminApiMessage } from "@/lib/admin/api-error-ar";

type Advisor = { id: number; name: string; title: string; image: string | null; bio: string | null };

const initialForm = { name: "", title: "", image: "", bio: "" };

export default function AdminAdvisorsPage() {
  const ap = adminCopy.advisorsPage;
  const c = adminCopy.common;
  const [items, setItems] = useState<Advisor[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const response = await fetch("/api/advisory-members?limit=100");
    const payload = await readAdminResponseJson(response);
    if (!response.ok || !payload?.success) {
      throw new Error((payload as { error?: string } | null)?.error ?? "Load failed");
    }
    const data = payload.data as { items?: Advisor[] } | undefined;
    setItems(data?.items ?? []);
  }, []);

  useEffect(() => {
    load().catch((e) => setError(translateAdminApiMessage(e instanceof Error ? e.message : "Load failed")));
  }, [load]);

  async function uploadPhotoAndGetUrl() {
    if (!photoFile) return form.image.trim() || null;
    return uploadAdvisoryMemberPhotoToStorage(photoFile);
  }

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
      const payload = await readAdminResponseJson(response);
      if (!response.ok || !payload?.success) {
        throw new Error((payload as { error?: string } | null)?.error ?? "Save failed");
      }
      setForm(initialForm);
      setPhotoFile(null);
      setEditingId(null);
      await load();
    } catch (e) {
      setError(translateAdminApiMessage(e instanceof Error ? e.message : "Save failed"));
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    if (!confirm(ap.confirmDelete)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/advisory-members/${id}`, { method: "DELETE" });
      const payload = await readAdminResponseJson(response);
      if (!response.ok || !payload?.success) {
        throw new Error((payload as { error?: string } | null)?.error ?? "Delete failed");
      }
      await load();
    } catch (e) {
      setError(translateAdminApiMessage(e instanceof Error ? e.message : "Delete failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>{ap.title}</h1>
        <p className={styles.adminSectionExplainer}>{ap.explainer}</p>
      </header>
      <section className={styles.adminSection}>
        <h3 className={styles.adminSectionTitle}>{editingId ? ap.editAdvisor : ap.addAdvisor}</h3>
        <p className={styles.adminSectionExplainer}>{ap.sectionFormExplainer}</p>
        <form className={styles.adminForm} onSubmit={submit}>
          <input className={styles.adminInput} placeholder={ap.placeholderName} value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required />
          <input className={styles.adminInput} placeholder={ap.placeholderTitle} value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} required />
          <input
            className={styles.adminInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
          />
          {photoFile ? (
            <p className={styles.adminHint}>
              {ap.photoSelected} {photoFile.name}
            </p>
          ) : null}
          {!photoFile && form.image ? (
            <p className={styles.adminHint}>
              {ap.photoCurrent}{" "}
              <a href={form.image} target="_blank" rel="noreferrer">
                {c.openImage}
              </a>
            </p>
          ) : null}
          {!photoFile && !form.image ? <p className={styles.adminHint}>{ap.photoNone}</p> : null}
          <textarea className={styles.adminTextarea} placeholder={ap.placeholderBio} value={form.bio} onChange={(e) => setForm((s) => ({ ...s, bio: e.target.value }))} />
          <div className={styles.adminActions}>
            <button className={`${styles.adminButton} ${styles.adminButtonPrimary}`} disabled={busy} type="submit">
              {editingId ? c.update : c.create}
            </button>
            {editingId ? (
              <button
                type="button"
                className={styles.adminButton}
                onClick={() => {
                  setEditingId(null);
                  setForm(initialForm);
                  setPhotoFile(null);
                }}
              >
                {c.cancel}
              </button>
            ) : null}
          </div>
        </form>
        {error ? <p className={styles.adminError}>{error}</p> : null}
      </section>
      <section className={styles.adminSection}>
        <h3 className={styles.adminSectionTitle}>{ap.listSectionTitle}</h3>
        <p className={styles.adminSectionExplainer}>{ap.listExplainer}</p>
        <ul className={styles.adminList}>
          {items.map((item) => (
            <li key={item.id} className={styles.adminListItem}>
              <span className={styles.adminListText}>
                <strong>{item.name}</strong>
                <br />
                {item.title}
              </span>
              <div className={styles.adminActions}>
                <button
                  type="button"
                  className={styles.adminButton}
                  onClick={() => {
                    setEditingId(item.id);
                    setPhotoFile(null);
                    setForm({ name: item.name, title: item.title, image: item.image ?? "", bio: item.bio ?? "" });
                  }}
                >
                  {c.edit}
                </button>
                <button type="button" className={`${styles.adminButton} ${styles.adminButtonDanger}`} onClick={() => remove(item.id)}>
                  {c.delete}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
