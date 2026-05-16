import { uploadBuffer, destroyBySecureUrl, type CloudinaryResourceType } from "@/lib/cloudinary";

export type UploadToStorageOptions = {
  folder: string;
  resourceType: CloudinaryResourceType;
  filename?: string;
};

export async function uploadFileToStorage(
  buffer: Buffer,
  options: UploadToStorageOptions,
): Promise<string> {
  const { secureUrl } = await uploadBuffer(buffer, options);
  return secureUrl;
}

/** Remove Cloudinary assets by delivery URL; legacy S3/local paths are no-op. */
export async function deleteStoredFile(filepath: string): Promise<void> {
  const fp = filepath.trim();
  if (!fp) return;
  if (fp.startsWith("/uploads/")) return;
  if (!/^https?:\/\//i.test(fp)) return;
  await destroyBySecureUrl(fp).catch(() => {
    /* best-effort; non-Cloudinary or already deleted */
  });
}
