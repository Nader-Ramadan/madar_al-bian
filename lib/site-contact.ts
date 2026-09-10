export const SITE_PHONE_DISPLAY = "+201037755238";

export const SITE_WHATSAPP_URL = "https://api.whatsapp.com/send?phone=201037755238";

export type SiteAddress = {
  label: string;
};

export const SITE_ADDRESSES: readonly SiteAddress[] = [
  { label: "الناشر الأول — عمّان، الأردن" },
  { label: "الناشر الثاني — القاهرة، مصر" },
] as const;
