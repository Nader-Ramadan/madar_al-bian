/**
 * Translates common English API / client error strings shown in the admin UI.
 * Unknown text is returned unchanged (may already be Arabic).
 */
const PAIRS: [string, string][] = [
  ["Failed to load dashboard data.", "تعذر تحميل بيانات لوحة التحكم."],
  ["Failed to load advisors.", "تعذر تحميل قائمة المستشارين."],
  ["Failed to load advisors", "تعذر تحميل قائمة المستشارين"],
  ["Failed to load data", "تعذر تحميل البيانات"],
  ["Failed to load magazines or versions.", "تعذر تحميل المجلات أو الإصدارات."],
  ["Failed to load researches", "تعذر تحميل البحوث"],
  ["Failed to load content modules", "تعذر تحميل وحدات المحتوى"],
  ["Failed to load publishing conditions", "تعذر تحميل شروط النشر"],
  ["Magazine not found", "المجلة غير موجودة"],
  ["Invalid magazine id", "معرّف المجلة غير صالح"],
  ["Save failed", "فشل الحفظ"],
  ["Delete failed", "فشل الحذف"],
  ["Load failed", "فشل التحميل"],
  ["Failed to create advisor", "تعذر إنشاء المستشار"],
  ["Could not upload photo", "تعذر رفع الصورة"],
  ["Upload failed", "تعذر رفع الملف"],
  ["Could not save magazine", "تعذر حفظ المجلة"],
  ["Could not save advisor", "تعذر حفظ المستشار"],
  ["Could not add selected advisor", "تعذر إضافة المستشار المحدد"],
  ["Could not save publishing condition", "تعذر حفظ تبويب شرط النشر"],
  ["Research save failed", "فشل حفظ البحث"],
  ["Version save failed", "فشل حفظ الإصدار"],
  ["Failed to send email", "فشل إرسال البريد"],
  ["Failed to change password", "فشل تغيير كلمة المرور"],
  ["Failed to fetch traffic data", "تعذر جلب بيانات الزيارات"],
  ["Error fetching traffic data", "خطأ أثناء جلب بيانات الزيارات"],
  ["Upload a banner image (JPEG, PNG, or WebP).", "ارفع صورة غلاف (JPEG أو PNG أو WebP)."],
  [
    "Upload a new banner or keep the existing one (re-open edit from the list).",
    "ارفع غلافًا جديدًا أو احتفظ بالغلاف الحالي (أعد فتح التحرير من القائمة).",
  ],
  ["Upload a photo (JPEG, PNG, or WebP).", "ارفع صورة (JPEG أو PNG أو WebP)."],
  ["Invalid magazine", "مجلة غير صالحة"],
];

export function translateAdminApiMessage(message: string): string {
  let out = message;
  for (const [en, ar] of PAIRS) {
    if (out.includes(en)) {
      out = out.split(en).join(ar);
    }
  }
  return out;
}
