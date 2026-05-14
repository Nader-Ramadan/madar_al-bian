export type StorageDriver = "s3" | "local";

/** Server-side storage mode (default `s3` for backward compatibility). */
export function getStorageDriver(): StorageDriver {
  const v = process.env.STORAGE_DRIVER?.trim().toLowerCase();
  return v === "local" ? "local" : "s3";
}
