import { v2 as cloudinary } from "cloudinary";

export type CloudinaryResourceType = "image" | "raw" | "auto";

function requireCloudinaryEnv() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }
  return { cloudName, apiKey, apiSecret };
}

function ensureConfigured() {
  const { cloudName, apiKey, apiSecret } = requireCloudinaryEnv();
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

function rootFolder(): string {
  const root = process.env.CLOUDINARY_UPLOAD_FOLDER?.trim().replace(/^\/+|\/+$/g, "");
  return root ?? "";
}

export function buildCloudinaryFolder(...segments: string[]): string {
  const parts = [rootFolder(), ...segments.map((s) => s.replace(/^\/+|\/+$/g, ""))].filter(Boolean);
  return parts.join("/");
}

export function isCloudinaryDeliveryUrl(url: string): boolean {
  try {
    return new URL(url.trim()).hostname.includes("cloudinary.com");
  } catch {
    return false;
  }
}

/** Sanitize a name for Cloudinary fl_attachment (dots are parsed as format flags). */
function attachmentFlagFilename(filename: string, defaultName: string): string {
  let safe = filename
    .replace(/[^a-zA-Z0-9._\u0600-\u06FF-]/g, "_")
    .replace(/\./g, "_")
    .replace(/_+/g, "_")
    .trim();
  if (!safe) {
    safe = defaultName
      .replace(/[^a-zA-Z0-9._\u0600-\u06FF-]/g, "_")
      .replace(/\./g, "_")
      .replace(/_+/g, "_")
      .trim();
  }
  return safe || "document_pdf";
}

/** Safe filename for fl_attachment; uses `_pdf` suffix (no dots — Cloudinary treats `.pdf` as a format flag). */
export function sanitizePdfDownloadFilename(name: string, fallback: string): string {
  let safe = attachmentFlagFilename(name, fallback);
  if (!safe.toLowerCase().endsWith("_pdf")) {
    safe = `${safe.replace(/_?pdf$/i, "")}_pdf`;
  }
  return safe;
}

/** Cloudinary delivery URL with attachment flag so browsers save with the correct name/type. */
export function cloudinaryAttachmentUrl(secureUrl: string, filename: string): string {
  const trimmed = secureUrl.trim();
  if (!trimmed || !isCloudinaryDeliveryUrl(trimmed)) return trimmed;
  if (!trimmed.includes("/upload/") || trimmed.includes("fl_attachment:")) return trimmed;
  const safe = attachmentFlagFilename(filename, "document_pdf");
  return trimmed.replace("/upload/", `/upload/fl_attachment:${safe}/`);
}

export async function uploadBuffer(
  buffer: Buffer,
  options: {
    folder: string;
    resourceType: CloudinaryResourceType;
    filename?: string;
  },
): Promise<{ secureUrl: string; publicId: string }> {
  ensureConfigured();
  const folder = buildCloudinaryFolder(options.folder);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: options.resourceType,
        use_filename: Boolean(options.filename),
        unique_filename: true,
        overwrite: false,
      },
      (err, result) => {
        if (err) return reject(err);
        if (!result?.secure_url || !result.public_id) {
          return reject(new Error("Cloudinary upload returned no URL"));
        }
        resolve({ secureUrl: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
}

/** Extract public_id and resource_type from a Cloudinary delivery URL for destroy(). */
export function parseCloudinaryDeliveryUrl(url: string): {
  publicId: string;
  resourceType: CloudinaryResourceType;
} | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("cloudinary.com")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    const uploadIdx = parts.indexOf("upload");
    if (uploadIdx < 0 || uploadIdx + 1 >= parts.length) return null;

    const typeBeforeUpload = parts[uploadIdx - 1];
    const resourceType: CloudinaryResourceType =
      typeBeforeUpload === "raw" ? "raw" : typeBeforeUpload === "image" ? "image" : "image";

    const afterUpload = parts.slice(uploadIdx + 1);
    let i = 0;
    if (/^v\d+$/.test(afterUpload[0] ?? "")) i = 1;
    const publicId = decodeURIComponent(afterUpload.slice(i).join("/"));
    if (!publicId) return null;

    return { publicId, resourceType };
  } catch {
    return null;
  }
}

export async function destroyBySecureUrl(url: string): Promise<void> {
  const parsed = parseCloudinaryDeliveryUrl(url.trim());
  if (!parsed) return;
  ensureConfigured();
  await cloudinary.uploader.destroy(parsed.publicId, {
    resource_type: parsed.resourceType,
    invalidate: true,
  });
}
