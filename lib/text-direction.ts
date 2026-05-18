const ARABIC_SCRIPT =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const LATIN_SCRIPT = /[A-Za-z\u00C0-\u024F]/;

/** RTL for predominantly Arabic text; LTR for predominantly Latin/English. */
export function getTextDirection(text: string): "rtl" | "ltr" {
  let arabic = 0;
  let latin = 0;
  for (const ch of text) {
    if (ARABIC_SCRIPT.test(ch)) arabic += 1;
    else if (LATIN_SCRIPT.test(ch)) latin += 1;
  }
  if (arabic === 0 && latin === 0) return "rtl";
  return arabic >= latin ? "rtl" : "ltr";
}

export function getTextLang(text: string): "ar" | "en" {
  return getTextDirection(text) === "rtl" ? "ar" : "en";
}

export function textDirectionAttrs(text: string): {
  dir: "rtl" | "ltr";
  lang: "ar" | "en";
} {
  const dir = getTextDirection(text);
  return { dir, lang: dir === "rtl" ? "ar" : "en" };
}
