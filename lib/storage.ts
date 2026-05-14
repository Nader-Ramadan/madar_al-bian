import { S3Client, DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function resolveS3Region(): string {
  const region =
    process.env.S3_REGION?.trim() ||
    process.env.AWS_REGION?.trim();
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
  const region =
    process.env.S3_REGION?.trim() ||
    process.env.AWS_REGION?.trim();
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
