/** Browser-side presigned uploads for admin dashboard (S3 via Next API routes). */

export async function readAdminResponseJson(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as { success?: boolean; data?: unknown; error?: string };
  } catch {
    return null;
  }
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

export async function uploadPdfFileToStorage(file: File): Promise<string> {
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
