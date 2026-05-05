"use client";

import { FormEvent, useEffect, useState } from "react";
import styles from "@/app/page.module.css";

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
      await save(blogForm.id ? `/api/blogs/${blogForm.id}` : "/api/blogs", blogForm.id ? "PUT" : "POST", {
        title: blogForm.title.trim(),
        summary: blogForm.summary.trim(),
        date: blogForm.date.trim(),
        author: blogForm.author.trim(),
        image: blogForm.image.trim() || null,
      });
      setBlogForm({ id: 0, title: "", summary: "", date: "", author: "", image: "" });
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
      await save(conferenceForm.id ? `/api/conferences/${conferenceForm.id}` : "/api/conferences", conferenceForm.id ? "PUT" : "POST", {
        title: conferenceForm.title.trim(),
        description: conferenceForm.description.trim(),
        date: conferenceForm.date.trim(),
        location: conferenceForm.location.trim(),
        image: conferenceForm.image.trim() || null,
        attendees: conferenceForm.attendees.trim() || null,
      });
      setConferenceForm({ id: 0, title: "", description: "", date: "", location: "", image: "", attendees: "" });
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
          <input className={styles.adminInput} placeholder="Image URL" value={blogForm.image} onChange={(e) => setBlogForm((s) => ({ ...s, image: e.target.value }))} />
          <button className={`${styles.adminButton} ${styles.adminButtonPrimary}`} disabled={busy} type="submit">{blogForm.id ? "Update blog" : "Create blog"}</button>
        </form>
        <ul className={styles.adminList}>
          {blogs.map((item) => (
            <li key={item.id} className={styles.adminListItem}>
              <span className={styles.adminListText}><strong>{item.title}</strong> - {item.author}</span>
              <div className={styles.adminActions}>
                <button className={styles.adminButton} onClick={() => setBlogForm({ id: item.id, title: item.title, summary: item.summary, date: item.date, author: item.author, image: item.image ?? "" })}>Edit</button>
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
          <input className={styles.adminInput} placeholder="Image URL" value={conferenceForm.image} onChange={(e) => setConferenceForm((s) => ({ ...s, image: e.target.value }))} />
          <input className={styles.adminInput} placeholder="Attendees" value={conferenceForm.attendees} onChange={(e) => setConferenceForm((s) => ({ ...s, attendees: e.target.value }))} />
          <button className={`${styles.adminButton} ${styles.adminButtonPrimary}`} disabled={busy} type="submit">{conferenceForm.id ? "Update conference" : "Create conference"}</button>
        </form>
        <ul className={styles.adminList}>
          {conferences.map((item) => (
            <li key={item.id} className={styles.adminListItem}>
              <span className={styles.adminListText}><strong>{item.title}</strong> - {item.location}</span>
              <div className={styles.adminActions}>
                <button className={styles.adminButton} onClick={() => setConferenceForm({ id: item.id, title: item.title, description: item.description, date: item.date, location: item.location, image: item.image ?? "", attendees: item.attendees ?? "" })}>Edit</button>
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
