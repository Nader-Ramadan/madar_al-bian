/** Browser-side uploads for admin dashboard: S3 presign + PUT, or multipart POST when STORAGE_DRIVER=local. */

export async function readAdminResponseJson(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as { success?: boolean; data?: unknown; error?: string };
  } catch {
    return null;
  }
}

function isClientLocalStorage(): boolean {
  return process.env.NEXT_PUBLIC_STORAGE_DRIVER?.trim().toLowerCase() === "local";
}

async function putToPresignedUrl(uploadUrl: string, file: File, contentType: string) {
  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  if (!putRes.ok) throw new Error("Upload to storage failed.");
}

function imageContentTypeForPresign(file: File): "image/jpeg" | "image/png" | "image/webp" {
  if (file.type === "image/png" || file.type === "image/webp" || file.type === "image/jpeg") {
    return file.type;
  }
  return "image/jpeg";
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
  if (isClientLocalStorage()) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/pdfs", { method: "PUT", body: fd });
    const payload = await readAdminResponseJson(res);
    if (!res.ok || !payload?.success) {
      throw new Error((payload as { error?: string })?.error ?? "Could not upload PDF");
    }
    return parseFileUrlFromOkPayload(payload);
  }

  const presignRes = await fetch("/api/pdfs", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      size: file.size,
    }),
  });
  const presignPayload = await readAdminResponseJson(presignRes);
  if (!presignRes.ok || !presignPayload?.success) {
    throw new Error((presignPayload as { error?: string })?.error ?? "Could not start PDF upload");
  }
  const { uploadUrl, fileUrl } = presignPayload.data as { uploadUrl: string; fileUrl: string };
  await putToPresignedUrl(uploadUrl, file, file.type);
  return fileUrl;
}

export async function uploadBannerFileToStorage(file: File, magazineId?: number): Promise<string> {
  if (isClientLocalStorage()) {
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

  const presignRes = await fetch("/api/admin/magazine-banner-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      magazineId,
      filename: file.name,
      contentType: imageContentTypeForPresign(file),
      size: file.size,
    }),
  });
  const presignPayload = await readAdminResponseJson(presignRes);
  if (!presignRes.ok || !presignPayload?.success) {
    throw new Error((presignPayload as { error?: string })?.error ?? "Could not start banner upload");
  }
  const { uploadUrl, fileUrl } = presignPayload.data as { uploadUrl: string; fileUrl: string };
  const ct = imageContentTypeForPresign(file);
  await putToPresignedUrl(uploadUrl, file, ct);
  return fileUrl;
}

export async function uploadMagazineAdvisorPhotoToStorage(file: File, magazineId: number): Promise<string> {
  if (isClientLocalStorage()) {
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

  const presignRes = await fetch("/api/admin/magazine-advisor-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      magazineId,
      filename: file.name,
      contentType: imageContentTypeForPresign(file),
      size: file.size,
    }),
  });
  const presignPayload = await readAdminResponseJson(presignRes);
  if (!presignRes.ok || !presignPayload?.success) {
    throw new Error((presignPayload as { error?: string })?.error ?? "Could not start advisor photo upload");
  }
  const { uploadUrl, fileUrl } = presignPayload.data as { uploadUrl: string; fileUrl: string };
  const ct = imageContentTypeForPresign(file);
  await putToPresignedUrl(uploadUrl, file, ct);
  return fileUrl;
}

export async function uploadAdvisoryMemberPhotoToStorage(file: File): Promise<string> {
  const ct = imageContentTypeForPresign(file);
  if (isClientLocalStorage()) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/advisory-member-upload", { method: "POST", body: fd });
    const payload = await readAdminResponseJson(res);
    if (!res.ok || !payload?.success) {
      throw new Error((payload as { error?: string })?.error ?? "Could not upload photo");
    }
    return parseFileUrlFromOkPayload(payload);
  }

  const presignRes = await fetch("/api/admin/advisory-member-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      contentType: ct,
      size: file.size,
    }),
  });
  const presignPayload = await readAdminResponseJson(presignRes);
  if (!presignRes.ok || !presignPayload?.success) {
    throw new Error((presignPayload as { error?: string })?.error ?? "Could not start photo upload");
  }
  const { uploadUrl, fileUrl } = presignPayload.data as { uploadUrl: string; fileUrl: string };
  await putToPresignedUrl(uploadUrl, file, ct);
  return fileUrl;
}

export async function uploadContentImageToStorage(file: File, kind: "blog" | "conference"): Promise<string> {
  const ct = imageContentTypeForPresign(file);
  if (isClientLocalStorage()) {
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

  const presignRes = await fetch("/api/admin/content-image-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind,
      filename: file.name,
      contentType: ct,
      size: file.size,
    }),
  });
  const presignPayload = await readAdminResponseJson(presignRes);
  if (!presignRes.ok || !presignPayload?.success) {
    throw new Error((presignPayload as { error?: string })?.error ?? "Could not start image upload");
  }
  const { uploadUrl, fileUrl } = presignPayload.data as { uploadUrl: string; fileUrl: string };
  await putToPresignedUrl(uploadUrl, file, ct);
  return fileUrl;
}
