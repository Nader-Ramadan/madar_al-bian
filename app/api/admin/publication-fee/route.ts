import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";
import { requireRole } from "@/lib/rbac";
import { publicationFeeSettingSchema } from "@/lib/schemas";
import { getPublicationFee } from "@/lib/publication-fee";
import { Decimal } from "@prisma/client/runtime/library";

export async function GET() {
  const auth = await requireRole([UserRole.ADMIN, UserRole.EDITOR]);
  if (auth.error) return auth.error;
  const fee = await getPublicationFee();
  return ok(fee);
}

export async function PUT(request: NextRequest) {
  const auth = await requireRole([UserRole.ADMIN]);
  if (auth.error) return auth.error;

  const parsed = publicationFeeSettingSchema.safeParse(await request.json());
  if (!parsed.success) return fail("بيانات غير صالحة", 400, parsed.error.flatten());

  const data = parsed.data;
  const updated = await prisma.publicationFeeSetting.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      amount: new Decimal(data.amount.toFixed(2)),
      currency: data.currency,
      enabled: data.enabled,
      labelAr: data.labelAr ?? null,
      labelEn: data.labelEn ?? null,
    },
    update: {
      amount: new Decimal(data.amount.toFixed(2)),
      currency: data.currency,
      enabled: data.enabled,
      labelAr: data.labelAr ?? null,
      labelEn: data.labelEn ?? null,
    },
  });

  return ok({
    enabled: updated.enabled,
    amount: updated.amount.toString(),
    currency: updated.currency,
    labelAr: updated.labelAr,
    labelEn: updated.labelEn,
  });
}
