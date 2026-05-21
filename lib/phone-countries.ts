export type PhoneCountry = {
  iso2: string;
  nameAr: string;
  nameEn: string;
  dial: string;
  flag: string;
  nationalMin: number;
  nationalMax: number;
};

/** Regional indicator flag from ISO 3166-1 alpha-2. */
export function flagFromIso2(iso2: string): string {
  const code = iso2.toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "";
  return String.fromCodePoint(
    ...[...code].map((char) => 0x1f1e6 - 65 + char.charCodeAt(0)),
  );
}

const COUNTRY_DEFS: Omit<PhoneCountry, "flag">[] = [
  { iso2: "EG", nameAr: "مصر", nameEn: "Egypt", dial: "+20", nationalMin: 9, nationalMax: 10 },
  { iso2: "SA", nameAr: "السعودية", nameEn: "Saudi Arabia", dial: "+966", nationalMin: 9, nationalMax: 9 },
  { iso2: "AE", nameAr: "الإمارات", nameEn: "United Arab Emirates", dial: "+971", nationalMin: 8, nationalMax: 9 },
  { iso2: "KW", nameAr: "الكويت", nameEn: "Kuwait", dial: "+965", nationalMin: 8, nationalMax: 8 },
  { iso2: "QA", nameAr: "قطر", nameEn: "Qatar", dial: "+974", nationalMin: 8, nationalMax: 8 },
  { iso2: "BH", nameAr: "البحرين", nameEn: "Bahrain", dial: "+973", nationalMin: 8, nationalMax: 8 },
  { iso2: "OM", nameAr: "عُمان", nameEn: "Oman", dial: "+968", nationalMin: 8, nationalMax: 8 },
  { iso2: "JO", nameAr: "الأردن", nameEn: "Jordan", dial: "+962", nationalMin: 8, nationalMax: 9 },
  { iso2: "LB", nameAr: "لبنان", nameEn: "Lebanon", dial: "+961", nationalMin: 7, nationalMax: 8 },
  { iso2: "IQ", nameAr: "العراق", nameEn: "Iraq", dial: "+964", nationalMin: 9, nationalMax: 10 },
  { iso2: "SY", nameAr: "سوريا", nameEn: "Syria", dial: "+963", nationalMin: 8, nationalMax: 9 },
  { iso2: "PS", nameAr: "فلسطين", nameEn: "Palestine", dial: "+970", nationalMin: 8, nationalMax: 9 },
  { iso2: "YE", nameAr: "اليمن", nameEn: "Yemen", dial: "+967", nationalMin: 8, nationalMax: 9 },
  { iso2: "LY", nameAr: "ليبيا", nameEn: "Libya", dial: "+218", nationalMin: 9, nationalMax: 10 },
  { iso2: "TN", nameAr: "تونس", nameEn: "Tunisia", dial: "+216", nationalMin: 8, nationalMax: 8 },
  { iso2: "DZ", nameAr: "الجزائر", nameEn: "Algeria", dial: "+213", nationalMin: 9, nationalMax: 9 },
  { iso2: "MA", nameAr: "المغرب", nameEn: "Morocco", dial: "+212", nationalMin: 9, nationalMax: 9 },
  { iso2: "SD", nameAr: "السودان", nameEn: "Sudan", dial: "+249", nationalMin: 9, nationalMax: 9 },
  { iso2: "TR", nameAr: "تركيا", nameEn: "Turkey", dial: "+90", nationalMin: 10, nationalMax: 10 },
  { iso2: "IR", nameAr: "إيران", nameEn: "Iran", dial: "+98", nationalMin: 10, nationalMax: 10 },
  { iso2: "PK", nameAr: "باكستان", nameEn: "Pakistan", dial: "+92", nationalMin: 10, nationalMax: 10 },
  { iso2: "IN", nameAr: "الهند", nameEn: "India", dial: "+91", nationalMin: 10, nationalMax: 10 },
  { iso2: "BD", nameAr: "بنغلاديش", nameEn: "Bangladesh", dial: "+880", nationalMin: 10, nationalMax: 10 },
  { iso2: "MY", nameAr: "ماليزيا", nameEn: "Malaysia", dial: "+60", nationalMin: 9, nationalMax: 10 },
  { iso2: "ID", nameAr: "إندونيسيا", nameEn: "Indonesia", dial: "+62", nationalMin: 9, nationalMax: 11 },
  { iso2: "GB", nameAr: "المملكة المتحدة", nameEn: "United Kingdom", dial: "+44", nationalMin: 10, nationalMax: 10 },
  { iso2: "US", nameAr: "الولايات المتحدة", nameEn: "United States", dial: "+1", nationalMin: 10, nationalMax: 10 },
  { iso2: "CA", nameAr: "كندا", nameEn: "Canada", dial: "+1", nationalMin: 10, nationalMax: 10 },
  { iso2: "DE", nameAr: "ألمانيا", nameEn: "Germany", dial: "+49", nationalMin: 10, nationalMax: 11 },
  { iso2: "FR", nameAr: "فرنسا", nameEn: "France", dial: "+33", nationalMin: 9, nationalMax: 9 },
  { iso2: "IT", nameAr: "إيطاليا", nameEn: "Italy", dial: "+39", nationalMin: 9, nationalMax: 10 },
  { iso2: "ES", nameAr: "إسبانيا", nameEn: "Spain", dial: "+34", nationalMin: 9, nationalMax: 9 },
  { iso2: "NL", nameAr: "هولندا", nameEn: "Netherlands", dial: "+31", nationalMin: 9, nationalMax: 9 },
  { iso2: "SE", nameAr: "السويد", nameEn: "Sweden", dial: "+46", nationalMin: 9, nationalMax: 10 },
  { iso2: "CH", nameAr: "سويسرا", nameEn: "Switzerland", dial: "+41", nationalMin: 9, nationalMax: 9 },
  { iso2: "AU", nameAr: "أستراليا", nameEn: "Australia", dial: "+61", nationalMin: 9, nationalMax: 9 },
  { iso2: "CN", nameAr: "الصين", nameEn: "China", dial: "+86", nationalMin: 11, nationalMax: 11 },
  { iso2: "JP", nameAr: "اليابان", nameEn: "Japan", dial: "+81", nationalMin: 10, nationalMax: 10 },
  { iso2: "KR", nameAr: "كوريا الجنوبية", nameEn: "South Korea", dial: "+82", nationalMin: 9, nationalMax: 10 },
  { iso2: "RU", nameAr: "روسيا", nameEn: "Russia", dial: "+7", nationalMin: 10, nationalMax: 10 },
  { iso2: "BR", nameAr: "البرازيل", nameEn: "Brazil", dial: "+55", nationalMin: 10, nationalMax: 11 },
  { iso2: "ZA", nameAr: "جنوب أفريقيا", nameEn: "South Africa", dial: "+27", nationalMin: 9, nationalMax: 9 },
  { iso2: "NG", nameAr: "نيجيريا", nameEn: "Nigeria", dial: "+234", nationalMin: 10, nationalMax: 10 },
  { iso2: "KE", nameAr: "كينيا", nameEn: "Kenya", dial: "+254", nationalMin: 9, nationalMax: 9 },
];

export const PHONE_COUNTRIES: PhoneCountry[] = COUNTRY_DEFS.map((c) => ({
  ...c,
  flag: flagFromIso2(c.iso2),
}));

const byIso = new Map(PHONE_COUNTRIES.map((c) => [c.iso2, c]));

export const DEFAULT_PHONE_COUNTRY_ISO = "EG";

export function getCountryByIso(iso2: string): PhoneCountry | undefined {
  return byIso.get(iso2.trim().toUpperCase());
}

/** Strip non-digits; remove leading trunk zero common in local formats. */
export function normalizeNationalDigits(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = digits.replace(/^0+/, "");
  return digits;
}

export function isValidNationalDigits(country: PhoneCountry, digits: string): boolean {
  if (!/^\d+$/.test(digits)) return false;
  return digits.length >= country.nationalMin && digits.length <= country.nationalMax;
}

export function composeAuthorPhone(iso2: string, nationalRaw: string): string {
  const country = getCountryByIso(iso2);
  if (!country) throw new Error("INVALID_COUNTRY");
  const digits = normalizeNationalDigits(nationalRaw);
  if (!isValidNationalDigits(country, digits)) throw new Error("INVALID_NATIONAL");
  return `${country.dial}${digits}`;
}

export type PhoneComposeResult =
  | { ok: true; authorPhone: string }
  | { ok: false; message: string };

export function validateAndComposeAuthorPhone(
  iso2: string,
  nationalRaw: string,
): PhoneComposeResult {
  const country = getCountryByIso(iso2);
  if (!country) {
    return { ok: false, message: "رمز الدولة غير مدعوم." };
  }
  const digits = normalizeNationalDigits(nationalRaw);
  if (!digits) {
    return { ok: false, message: "رقم الهاتف مطلوب." };
  }
  if (!isValidNationalDigits(country, digits)) {
    return {
      ok: false,
      message: `رقم الهاتف غير صالح (${country.nationalMin}–${country.nationalMax} أرقام).`,
    };
  }
  const authorPhone = `${country.dial}${digits}`;
  if (authorPhone.length > 32) {
    return { ok: false, message: "رقم الهاتف طويل جداً." };
  }
  return { ok: true, authorPhone };
}

export function formatCountryOptionLabel(country: PhoneCountry): string {
  return `${country.nameAr} (${country.dial})`;
}

/** PNG flag URL (works on Windows where Unicode flag emoji often does not render). */
export function countryFlagImageUrl(iso2: string, width = 40): string {
  return `https://flagcdn.com/w${width}/${iso2.toLowerCase()}.png`;
}
