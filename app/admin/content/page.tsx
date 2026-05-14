"use client";

import { FormEvent, useEffect, useState } from "react";
import styles from "@/app/page.module.css";
import { uploadContentImageToStorage } from "@/lib/admin-client-upload";

type Blog = { id: number; title: string; summary: string; date: string; author: string; image?: string | null };
type Conference = { id: number; title: string; description: string; date: string; location: string; image?: string | null; attendees?: string | null };
type Field = { id: number; name: string; description: string };

export default function AdminContentPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [blogForm, setBlogForm] = useState({ id: 0, title: "", summary: "", date: "", author: "", image: "" });
  const [conferenceForm, setConferenceForm] = useState({ id: 0, title: "", description: "", date: "", location: "", image: "", attendees: "" });
  const [fieldForm, setFieldForm] = useState({ id: 0, name: "", description: "" });
  const [blogImageFile, setBlogImageFile] = useState<File | null>(null);
  const [blogImageInputKey, setBlogImageInputKey] = useState(0);
  const [conferenceImageFile, setConferenceImageFile] = useState<File | null>(null);
  const [conferenceImageInputKey, setConferenceImageInputKey] = useState(0);

  async function load() {
    const [bRes, cRes, fRes] = await Promise.all([
      fetch("/api/blogs?limit=100"),
      fetch("/api/conferences?limit=100"),
      fetch("/api/fields?limit=100"),
    ]);
    const [b, c, f] = await Promise.all([bRes.json(), cRes.json(), fRes.json()]);
    if (!bRes.ok || !cRes.ok || !fRes.ok) throw new Error("Failed to load content modules");
    setBlogs(b?.data?.items ?? []);
    setConferences(c?.data?.items ?? []);
    setFields(f?.data?.items ?? []);
  }

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : "Load failed"));
  }, []);

  async function save(path: string, method: string, body: Record<string, unknown>) {
    const response = await fetch(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const payload = await response.json();
    if (!response.ok || !payload?.success) throw new Error(payload?.error ?? "Save failed");
  }

  async function remove(path: string) {
    const response = await fetch(path, { method: "DELETE" });
    const payload = await response.json();
    if (!response.ok || !payload?.success) throw new Error(payload?.error ?? "Delete failed");
  }

  async function submitBlog(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      let imageUrl: string | null = blogForm.image.trim() || null;
      if (blogImageFile) {
        imageUrl = await uploadContentImageToStorage(blogImageFile, "blog");
      }
      await save(blogForm.id ? `/api/blogs/${blogForm.id}` : "/api/blogs", blogForm.id ? "PUT" : "POST", {
        title: blogForm.title.trim(),
        summary: blogForm.summary.trim(),
        date: blogForm.date.trim(),
        author: blogForm.author.trim(),
        image: imageUrl,
      });
      setBlogForm({ id: 0, title: "", summary: "", date: "", author: "", image: "" });
      setBlogImageFile(null);
      setBlogImageInputKey((k) => k + 1);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally { setBusy(false); }
  }

  async function submitConference(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      let imageUrl: string | null = conferenceForm.image.trim() || null;
      if (conferenceImageFile) {
        imageUrl = await uploadContentImageToStorage(conferenceImageFile, "conference");
      }
      await save(conferenceForm.id ? `/api/conferences/${conferenceForm.id}` : "/api/conferences", conferenceForm.id ? "PUT" : "POST", {
        title: conferenceForm.title.trim(),
        description: conferenceForm.description.trim(),
        date: conferenceForm.date.trim(),
        location: conferenceForm.location.trim(),
        image: imageUrl,
        attendees: conferenceForm.attendees.trim() || null,
      });
      setConferenceForm({ id: 0, title: "", description: "", date: "", location: "", image: "", attendees: "" });
      setConferenceImageFile(null);
      setConferenceImageInputKey((k) => k + 1);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally { setBusy(false); }
  }

  async function submitField(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await save(fieldForm.id ? `/api/fields/${fieldForm.id}` : "/api/fields", fieldForm.id ? "PUT" : "POST", {
        name: fieldForm.name.trim(),
        description: fieldForm.description.trim(),
      });
      setFieldForm({ id: 0, name: "", description: "" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally { setBusy(false); }
  }

  async function deleteItem(path: string) {
    if (!confirm("Delete this item?")) return;
    setBusy(true);
    try {
      await remove(path);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally { setBusy(false); }
  }

  return (
    <div className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>Content CRUD</h1>
        <p className={styles.adminSubtitle}>Manage blogs, conferences, and fields from one dashboard.</p>
      </header>
      {error ? <p className={styles.adminError}>{error}</p> : null}

      <section className={styles.adminSection}>
        <h3 className={styles.adminSectionTitle}>{blogForm.id ? "Edit blog" : "Create blog"}</h3>
        <form className={styles.adminForm} onSubmit={submitBlog}>
          <input className={styles.adminInput} placeholder="Title" value={blogForm.title} onChange={(e) => setBlogForm((s) => ({ ...s, title: e.target.value }))} required />
          <textarea className={styles.adminTextarea} placeholder="Summary" value={blogForm.summary} onChange={(e) => setBlogForm((s) => ({ ...s, summary: e.target.value }))} required />
          <input className={styles.adminInput} placeholder="Date" value={blogForm.date} onChange={(e) => setBlogForm((s) => ({ ...s, date: e.target.value }))} required />
          <input className={styles.adminInput} placeholder="Author" value={blogForm.author} onChange={(e) => setBlogForm((s) => ({ ...s, author: e.target.value }))} required />
          {blogForm.image.trim() ? (
            <p className={styles.adminSubtitle}>
              Current image:{" "}
              <a href={blogForm.image} target="_blank" rel="noreferrer">
                Open
              </a>{" "}
              — upload below to replace.
            </p>
          ) : (
            <p className={styles.adminSubtitle}>Optional cover image: upload a file below.</p>
          )}
          <input
            key={blogImageInputKey}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setBlogImageFile(e.target.files?.[0] ?? null)}
          />
          {blogImageFile ? <p className={styles.adminHint}>Selected: {blogImageFile.name}</p> : null}
          <button className={`${styles.adminButton} ${styles.adminButtonPrimary}`} disabled={busy} type="submit">{blogForm.id ? "Update blog" : "Create blog"}</button>
        </form>
        <ul className={styles.adminList}>
          {blogs.map((item) => (
            <li key={item.id} className={styles.adminListItem}>
              <span className={styles.adminListText}><strong>{item.title}</strong> - {item.author}</span>
              <div className={styles.adminActions}>
                <button className={styles.adminButton} onClick={() => {
                  setBlogImageFile(null);
                  setBlogImageInputKey((k) => k + 1);
                  setBlogForm({ id: item.id, title: item.title, summary: item.summary, date: item.date, author: item.author, image: item.image ?? "" });
                }}>Edit</button>
                <button className={`${styles.adminButton} ${styles.adminButtonDanger}`} onClick={() => deleteItem(`/api/blogs/${item.id}`)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.adminSection}>
        <h3 className={styles.adminSectionTitle}>{conferenceForm.id ? "Edit conference" : "Create conference"}</h3>
        <form className={styles.adminForm} onSubmit={submitConference}>
          <input className={styles.adminInput} placeholder="Title" value={conferenceForm.title} onChange={(e) => setConferenceForm((s) => ({ ...s, title: e.target.value }))} required />
          <textarea className={styles.adminTextarea} placeholder="Description" value={conferenceForm.description} onChange={(e) => setConferenceForm((s) => ({ ...s, description: e.target.value }))} required />
          <input className={styles.adminInput} placeholder="Date" value={conferenceForm.date} onChange={(e) => setConferenceForm((s) => ({ ...s, date: e.target.value }))} required />
          <input className={styles.adminInput} placeholder="Location" value={conferenceForm.location} onChange={(e) => setConferenceForm((s) => ({ ...s, location: e.target.value }))} required />
          {conferenceForm.image.trim() ? (
            <p className={styles.adminSubtitle}>
              Current image:{" "}
              <a href={conferenceForm.image} target="_blank" rel="noreferrer">
                Open
              </a>{" "}
              — upload below to replace.
            </p>
          ) : (
            <p className={styles.adminSubtitle}>Optional image: upload a file below.</p>
          )}
          <input
            key={conferenceImageInputKey}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setConferenceImageFile(e.target.files?.[0] ?? null)}
          />
          {conferenceImageFile ? <p className={styles.adminHint}>Selected: {conferenceImageFile.name}</p> : null}
          <input className={styles.adminInput} placeholder="Attendees" value={conferenceForm.attendees} onChange={(e) => setConferenceForm((s) => ({ ...s, attendees: e.target.value }))} />
          <button className={`${styles.adminButton} ${styles.adminButtonPrimary}`} disabled={busy} type="submit">{conferenceForm.id ? "Update conference" : "Create conference"}</button>
        </form>
        <ul className={styles.adminList}>
          {conferences.map((item) => (
            <li key={item.id} className={styles.adminListItem}>
              <span className={styles.adminListText}><strong>{item.title}</strong> - {item.location}</span>
              <div className={styles.adminActions}>
                <button className={styles.adminButton} onClick={() => {
                  setConferenceImageFile(null);
                  setConferenceImageInputKey((k) => k + 1);
                  setConferenceForm({ id: item.id, title: item.title, description: item.description, date: item.date, location: item.location, image: item.image ?? "", attendees: item.attendees ?? "" });
                }}>Edit</button>
                <button className={`${styles.adminButton} ${styles.adminButtonDanger}`} onClick={() => deleteItem(`/api/conferences/${item.id}`)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.adminSection}>
        <h3 className={styles.adminSectionTitle}>{fieldForm.id ? "Edit field" : "Create field"}</h3>
        <form className={styles.adminForm} onSubmit={submitField}>
          <input className={styles.adminInput} placeholder="Field name" value={fieldForm.name} onChange={(e) => setFieldForm((s) => ({ ...s, name: e.target.value }))} required />
          <textarea className={styles.adminTextarea} placeholder="Description" value={fieldForm.description} onChange={(e) => setFieldForm((s) => ({ ...s, description: e.target.value }))} required />
          <button className={`${styles.adminButton} ${styles.adminButtonPrimary}`} disabled={busy} type="submit">{fieldForm.id ? "Update field" : "Create field"}</button>
        </form>
        <ul className={styles.adminList}>
          {fields.map((item) => (
            <li key={item.id} className={styles.adminListItem}>
              <span className={styles.adminListText}><strong>{item.name}</strong></span>
              <div className={styles.adminActions}>
                <button className={styles.adminButton} onClick={() => setFieldForm({ id: item.id, name: item.name, description: item.description })}>Edit</button>
                <button className={`${styles.adminButton} ${styles.adminButtonDanger}`} onClick={() => deleteItem(`/api/fields/${item.id}`)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
