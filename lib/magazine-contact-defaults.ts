import { SITE_ADDRESSES, SITE_WHATSAPP_URL } from "@/lib/site-contact";

export const MAGAZINE_CONTACT_DEFAULTS = {
  phone: "٠٠٢ +١٠٦٦٢٢٣٣٩٩",
  phoneTel: "+201066223399",
  email: "info@madar-albian.com",
  addresses: SITE_ADDRESSES.map((a) => a.label),
} as const;

export type MagazineContactSource = {
  contactPhone?: string | null;
  contactPhoneTel?: string | null;
  contactEmail?: string | null;
  contactAddress?: string | null;
};

export type ResolvedMagazineContact = {
  phone: string;
  phoneHref: string | null;
  email: string;
  emailHref: string;
  /** One or more address lines (defaults = both publishers; custom override = single line). */
  addresses: string[];
};

function nonEmpty(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Strip non-digits; prefix with + when digits remain. */
export function deriveTelFromPhone(displayPhone: string): string | null {
  const digits = displayPhone.replace(/\D/g, "");
  if (!digits) return null;
  return `+${digits}`;
}

export function resolveMagazineContact(magazine: MagazineContactSource): ResolvedMagazineContact {
  const customPhone = nonEmpty(magazine.contactPhone);
  const customTel = nonEmpty(magazine.contactPhoneTel);
  const customEmail = nonEmpty(magazine.contactEmail);
  const customAddress = nonEmpty(magazine.contactAddress);

  const phone = customPhone ?? MAGAZINE_CONTACT_DEFAULTS.phone;
  const phoneTel =
    customTel ?? (customPhone ? deriveTelFromPhone(customPhone) : null) ?? MAGAZINE_CONTACT_DEFAULTS.phoneTel;
  const email = customEmail ?? MAGAZINE_CONTACT_DEFAULTS.email;
  const addresses = customAddress ? [customAddress] : [...MAGAZINE_CONTACT_DEFAULTS.addresses];

  return {
    phone,
    phoneHref: phoneTel ? SITE_WHATSAPP_URL : null,
    email,
    emailHref: `mailto:${email}`,
    addresses,
  };
}
