/** Browser-side uploads for admin dashboard: S3 presign + PUT, or multipart POST when storage is local. */

export async function readAdminResponseJson(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as { success?: boolean; data?: unknown; error?: string };
  } catch {
    return null;
  }
}

let cachedServerDriver: "local" | "s3" | undefined;

function publicEnvDriver(): "local" | "s3" | undefined {
  const v = process.env.NEXT_PUBLIC_STORAGE_DRIVER?.trim().toLowerCase();
  if (v === "local" || v === "s3") return v;
  return undefined;
}

/** Prefer NEXT_PUBLIC_* when set; otherwise ask the server once (matches STORAGE_DRIVER on the host). */
async function useLocalMultipartUpload(): Promise<boolean> {
  const pub = publicEnvDriver();
  if (pub === "local") return true;
  if (pub === "s3") return false;
  if (cachedServerDriver) return cachedServerDriver === "local";
  const res = await fetch("/api/admin/storage-driver", { credentials: "same-origin" });
  const payload = await readAdminResponseJson(res);
  if (!res.ok || !payload?.success || !payload.data || typeof payload.data !== "object") {
    throw new Error(
      res.status === 401 || res.status === 403
        ? "Session expired or not allowed. Sign in again, or set NEXT_PUBLIC_STORAGE_DRIVER to match STORAGE_DRIVER."
        : "Could not read storage mode from the server. Set NEXT_PUBLIC_STORAGE_DRIVER to local or s3, or try again after signing in.",
    );
  }
  const d = (payload.data as { storageDriver?: string }).storageDriver;
  cachedServerDriver = d === "local" ? "local" : "s3";
  return cachedServerDriver === "local";
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
  if (await useLocalMultipartUpload()) {
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
  if (await useLocalMultipartUpload()) {
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
  if (await useLocalMultipartUpload()) {
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
  if (await useLocalMultipartUpload()) {
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
  if (await useLocalMultipartUpload()) {
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
