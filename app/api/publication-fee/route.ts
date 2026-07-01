import { ok } from "@/lib/api-response";
import { formatFeeDisplay, getPublicationFee } from "@/lib/publication-fee";

export async function GET() {
  const fee = await getPublicationFee();
  return ok({
    enabled: fee.enabled,
    amount: fee.amount,
    currency: fee.currency,
    label: formatFeeDisplay(fee),
    labelAr: fee.labelAr,
    labelEn: fee.labelEn,
  });
}
