import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export type PublicationFeeConfig = {
  enabled: boolean;
  amount: string;
  currency: string;
  labelAr: string | null;
  labelEn: string | null;
};

const SUPPORTED_CURRENCIES = ["USD", "EUR", "SAR", "EGP"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export function isSupportedCurrency(value: string): value is SupportedCurrency {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(value);
}

function decimalToAmountString(value: Decimal | number | string): string {
  return new Decimal(value).toFixed(2);
}

function envFallbackFee(): PublicationFeeConfig {
  const amount = process.env.PUBLICATION_FEE_AMOUNT ?? "0";
  const currency = (process.env.PUBLICATION_FEE_CURRENCY ?? "USD").toUpperCase();
  return {
    enabled: false,
    amount: decimalToAmountString(amount),
    currency: isSupportedCurrency(currency) ? currency : "USD",
    labelAr: null,
    labelEn: null,
  };
}

export async function getPublicationFee(): Promise<PublicationFeeConfig> {
  try {
    const row = await prisma.publicationFeeSetting.findUnique({ where: { id: 1 } });
    if (!row) return envFallbackFee();
    return {
      enabled: row.enabled,
      amount: decimalToAmountString(row.amount),
      currency: row.currency,
      labelAr: row.labelAr,
      labelEn: row.labelEn,
    };
  } catch {
    return envFallbackFee();
  }
}

export async function getPublicationFeeForPayment(): Promise<
  PublicationFeeConfig & { amountNumber: number }
> {
  const fee = await getPublicationFee();
  return { ...fee, amountNumber: Number.parseFloat(fee.amount) };
}

export function formatFeeDisplay(fee: PublicationFeeConfig): string {
  const label = fee.labelAr?.trim() || fee.labelEn?.trim();
  if (label) return label;
  return `${fee.amount} ${fee.currency}`;
}
