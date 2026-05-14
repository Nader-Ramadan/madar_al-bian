import { S3Client, DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "node:fs/promises";
import path from "node:path";
import { getStorageDriver } from "@/lib/storage-driver";

function resolveS3Region(): string {
  const region = process.env.S3_REGION?.trim() || process.env.AWS_REGION?.trim();
  if (!region) {
    throw new Error(
      "Missing AWS region for S3: set S3_REGION or AWS_REGION (required for uploads and signing).",
    );
  }
  return region;
}

let s3Client: S3Client | undefined;

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: resolveS3Region(),
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
      },
    });
  }
  return s3Client;
}

export function getS3PublicUrl(key: string) {
  const base = process.env.S3_PUBLIC_BASE_URL;
  if (base) return `${base.replace(/\/$/, "")}/${key}`;
  const region = process.env.S3_REGION?.trim() || process.env.AWS_REGION?.trim();
  if (!region) {
    throw new Error(
      "Set S3_PUBLIC_BASE_URL, or both S3_BUCKET and S3_REGION (or AWS_REGION) for default S3 URLs.",
    );
  }
  return `https://${process.env.S3_BUCKET}.s3.${region}.amazonaws.com/${key}`;
}

export async function createUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(getS3Client(), command, { expiresIn: 300 });
  return { uploadUrl, fileUrl: getS3PublicUrl(key) };
}

export async function deleteObjectByKey(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  });
  await getS3Client().send(command);
}

const UPLOADS_ROOT = () => path.resolve(process.cwd(), "public", "uploads");

/** Reject path traversal and absolute paths for keys under public/uploads. */
export function assertSafeRelativeStorageKey(relativeKey: string): void {
  if (!relativeKey || relativeKey.includes("\0")) {
    throw new Error("Invalid storage key");
  }
  const normalized = path.normalize(relativeKey);
  if (path.isAbsolute(normalized) || normalized.startsWith("..")) {
    throw new Error("Invalid storage key");
  }
  const resolvedFile = path.resolve(UPLOADS_ROOT(), normalized);
  const root = UPLOADS_ROOT();
  if (resolvedFile !== root && !resolvedFile.startsWith(root + path.sep)) {
    throw new Error("Invalid storage key");
  }
}

/**
 * Write bytes under public/uploads/{relativeKey} and return same-origin URL `/uploads/...`.
 */
export async function saveLocalObject(relativeKey: string, buffer: Buffer, _contentType: string) {
  assertSafeRelativeStorageKey(relativeKey);
  const fullPath = path.join(UPLOADS_ROOT(), relativeKey);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, buffer);
  const posixKey = relativeKey.split(path.sep).join("/");
  return `/uploads/${posixKey}`;
}

export async function deleteLocalObjectByRelativeKey(relativeKey: string) {
  assertSafeRelativeStorageKey(relativeKey);
  const fullPath = path.join(UPLOADS_ROOT(), relativeKey);
  await fs.unlink(fullPath).catch((err: NodeJS.ErrnoException) => {
    if (err.code !== "ENOENT") throw err;
  });
}

/**
 * Remove a stored file: local `/uploads/...` paths or HTTPS S3/CDN URLs (object key from pathname).
 */
export async function deleteStoredFile(filepath: string): Promise<void> {
  const fp = filepath.trim();
  if (!fp) return;

  if (fp.startsWith("/uploads/")) {
    const relative = fp.replace(/^\/uploads\/?/, "");
    await deleteLocalObjectByRelativeKey(relative);
    return;
  }

  if (!/^https?:\/\//i.test(fp) || getStorageDriver() !== "s3") {
    return;
  }

  let key: string;
  try {
    key = new URL(fp).pathname.replace(/^\/+/, "");
  } catch {
    return;
  }
  if (!key) return;
  await deleteObjectByKey(key);
}
