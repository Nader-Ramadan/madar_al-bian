import { UserRole } from "@prisma/client";
import { ok } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import { getStorageDriver } from "@/lib/storage-driver";

/** Lets the admin client use multipart vs presign to match the server when NEXT_PUBLIC_STORAGE_DRIVER is unset. */
export async function GET() {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;
  return ok({ storageDriver: getStorageDriver() });
}
