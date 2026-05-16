/** Browser-side multipart uploads to Next API routes (Cloudinary on the server). */

export async function readAdminResponseJson(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as { success?: boolean; data?: unknown; error?: string };
  } catch {
    return null;
  }
}

function parseFileUrlFromOkPayload(payload: { success?: boolean; data?: unknown } | null): string {
  if (!payload?.success || !payload.data || typeof payload.data !== "object") {
    throw new Error((payload as { error?: string })?.error ?? "Upload failed");
  }
  const data = payload.data as { fileUrl?: string };
  if (!data.fileUrl) throw new Error("Missing file URL in response");
  return data.fileUrl;
}

export async function uploadPdfFileToStorage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/pdfs", { method: "PUT", body: fd });
  const payload = await readAdminResponseJson(res);
  if (!res.ok || !payload?.success) {
    throw new Error((payload as { error?: string })?.error ?? "Could not upload PDF");
  }
  return parseFileUrlFromOkPayload(payload);
}

export async function uploadBannerFileToStorage(file: File, magazineId?: number): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  if (magazineId != null) fd.append("magazineId", String(magazineId));
  const res = await fetch("/api/admin/magazine-banner-upload", { method: "POST", body: fd });
  const payload = await readAdminResponseJson(res);
  if (!res.ok || !payload?.success) {
    throw new Error((payload as { error?: string })?.error ?? "Could not upload banner");
  }
  return parseFileUrlFromOkPayload(payload);
}

export async function uploadMagazineAdvisorPhotoToStorage(file: File, magazineId: number): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("magazineId", String(magazineId));
  const res = await fetch("/api/admin/magazine-advisor-upload", { method: "POST", body: fd });
  const payload = await readAdminResponseJson(res);
  if (!res.ok || !payload?.success) {
    throw new Error((payload as { error?: string })?.error ?? "Could not upload advisor photo");
  }
  return parseFileUrlFromOkPayload(payload);
}

export async function uploadAdvisoryMemberPhotoToStorage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/advisory-member-upload", { method: "POST", body: fd });
  const payload = await readAdminResponseJson(res);
  if (!res.ok || !payload?.success) {
    throw new Error((payload as { error?: string })?.error ?? "Could not upload photo");
  }
  return parseFileUrlFromOkPayload(payload);
}

export async function uploadContentImageToStorage(file: File, kind: "blog" | "conference"): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("kind", kind);
  const res = await fetch("/api/admin/content-image-upload", { method: "POST", body: fd });
  const payload = await readAdminResponseJson(res);
  if (!res.ok || !payload?.success) {
    throw new Error((payload as { error?: string })?.error ?? "Could not upload image");
  }
  return parseFileUrlFromOkPayload(payload);
}
