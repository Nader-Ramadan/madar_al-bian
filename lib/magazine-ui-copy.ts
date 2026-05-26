import type { MagazineLocale } from "@/lib/magazine-language";

export type MagazineUiCopy = {
  meta: {
    magazine: string;
    magazineIssue: string;
    research: string;
    publishingConditions: string;
    versionsArchive: string;
  };
  banner: {
    eyebrow: string;
    noDescription: string;
    coverAlt: (title: string) => string;
  };
  content: {
    impactFactor: string;
    nextRelease: string;
    submitResearch: string;
    publishingConditionsTitle: string;
    publishingConditionsSubtitle: (count: number) => string;
    publishingConditionsArrow: string;
    aboutTitle: (title: string) => string;
    fieldsHeading: string;
    defaultCategory: string;
    contactTitle: string;
    phone: string;
    email: string;
    address: string;
    visionMissionTitle: string;
    vision: string;
    mission: string;
    defaultVision: string;
    defaultMission: string;
    accreditationTitle: string;
    accreditationPlaceholder: string;
    statsTitle: string;
    statVersions: string;
    statCurrentVersion: string;
    statNextRelease: string;
    statImpactFactor: string;
    emDash: string;
  };
  advisors: {
    title: string;
    intro: string;
  };
  versions: {
    title: string;
    publishingConditions: string;
    fullArchive: string;
    chevron: string;
    downloadMagazinePdf: string;
    noMagazinePdf: string;
    emptyVersions: string;
    issueBadge: (version: string) => string;
    releaseDate: (label: string) => string;
    researchesCta: string;
  };
  archive: {
    backToMagazine: string;
    versionsTitle: string;
    emptyVersions: string;
    latestBadge: string;
    researchesCta: string;
    pageCountLink: (count: number) => string;
    downloadPdf: string;
    pageCountPlain: (count: number) => string;
    unspecified: string;
  };
  versionHub: {
    backToMagazine: string;
    versionsArchive: string;
    issueLabel: (version: string) => string;
    emptyResearches: string;
  };
  research: {
    backToResearches: string;
    magazine: string;
    issueLabel: (version: string) => string;
    summary: string;
    noSummary: string;
    keywords: string;
    noKeywords: string;
    downloadPdf: string;
    externalLink: string;
  };
  publishingConditionsPage: {
    backToMagazine: string;
    title: string;
    subtitle: string;
  };
  publishingConditionsTabs: {
    emptyTitle: string;
    emptyText: string;
    tablistLabel: string;
    sectionsHeader: string;
    mobileTablistLabel: string;
    sectionMeta: (current: string, total: string) => string;
  };
};

const ar: MagazineUiCopy = {
  meta: {
    magazine: "مجلة",
    magazineIssue: "إصدار المجلة",
    research: "بحث",
    publishingConditions: "شروط النشر",
    versionsArchive: "إصدارات المجلة",
  },
  banner: {
    eyebrow: "مجلة محكّمة",
    noDescription: "لا يتوفر وصف مختصر لهذه المجلة.",
    coverAlt: (title) => `غلاف ${title}`,
  },
  content: {
    impactFactor: "معامل التأثير",
    nextRelease: "الإصدار القادم",
    submitResearch: "قدّم بحثك",
    publishingConditionsTitle: "شروط النشر",
    publishingConditionsSubtitle: (count) =>
      `اطّلع على ${count} ${count === 1 ? "قسم" : "أقسام"} من الإرشادات الخاصة بالمجلة قبل التقديم.`,
    publishingConditionsArrow: "←",
    aboutTitle: (title) => `عن المجلة: ${title}`,
    fieldsHeading: "مجالات النشر",
    defaultCategory: "متعدد التخصصات",
    contactTitle: "معلومات التواصل",
    phone: "الهاتف",
    email: "البريد",
    address: "العنوان",
    visionMissionTitle: "الرؤية والرسالة",
    vision: "الرؤية",
    mission: "الرسالة",
    defaultVision: "نسعى إلى الريادة في نشر المعرفة الأكاديمية الرصينة في مجالات تخصص المجلة.",
    defaultMission:
      "دعم الباحثين بعملية تحكيم مهنية وتقديم محتوى مفتوح الوصول يعكس معايير الجودة العالمية.",
    accreditationTitle: "الاعتمادات والفهرسة",
    accreditationPlaceholder:
      "تفاصيل الاعتمادات والفهرسة تُحدَّث من إدارة المجلة. تواصل معنا للاستفسار.",
    statsTitle: "إحصائيات المجلة",
    statVersions: "إصدارات مسجّلة",
    statCurrentVersion: "الإصدار الحالي",
    statNextRelease: "موعد الإصدار القادم",
    statImpactFactor: "معامل التأثير",
    emDash: "—",
  },
  advisors: {
    title: "لجنة التحكيم",
    intro: "أعضاء اللجنة الذين وافقوا على نشر هذه المجلة",
  },
  versions: {
    title: "إصدارات المجلة",
    publishingConditions: "شروط النشر",
    fullArchive: "عرض سجل الإصدارات كاملاً",
    chevron: "‹",
    downloadMagazinePdf: "تحميل المجلة (PDF)",
    noMagazinePdf: "لا يتوفر ملف PDF لهذه المجلة حاليًا.",
    emptyVersions: "لا توجد إصدارات مسجّلة لهذه المجلة بعد.",
    issueBadge: (version) => `إصدار ${version}`,
    releaseDate: (label) => `تاريخ الإصدار: ${label}`,
    researchesCta: "بحوث هذا الإصدار",
  },
  archive: {
    backToMagazine: "← العودة للمجلة",
    versionsTitle: "إصدارات المجلة",
    emptyVersions: "لا توجد إصدارات مسجّلة لهذه المجلة بعد.",
    latestBadge: "أحدث إصدار",
    researchesCta: "بحوث هذا الإصدار",
    pageCountLink: (count) => `عدد الأوراق (${count})`,
    downloadPdf: "تحميل PDF",
    pageCountPlain: (count) => `عدد الأوراق (${count})`,
    unspecified: "غير محدد",
  },
  versionHub: {
    backToMagazine: "← العودة للمجلة",
    versionsArchive: "سجل الإصدارات",
    issueLabel: (version) => `إصدار ${version}`,
    emptyResearches: "لا توجد بحوث مسجّلة لهذا الإصدار بعد.",
  },
  research: {
    backToResearches: "← العودة لقائمة البحوث",
    magazine: "المجلة",
    issueLabel: (version) => `إصدار ${version}`,
    summary: "الملخص",
    noSummary: "لم يُضف ملخص لهذا البحث بعد.",
    keywords: ":الكلمات المفتاحية",
    noKeywords: "لا توجد كلمات مفتاحية مسجّلة لهذا البحث.",
    downloadPdf: "تحميل البحث (PDF)",
    externalLink: "فتح صفحة البحث الأصلية",
  },
  publishingConditionsPage: {
    backToMagazine: "← العودة للمجلة",
    title: "شروط النشر",
    subtitle: "تعرّف على المتطلبات والإرشادات التي يجب اتّباعها قبل تقديم بحثك إلى المجلة.",
  },
  publishingConditionsTabs: {
    emptyTitle: "لا توجد أقسام بعد",
    emptyText:
      "سيتم نشر شروط النشر لهذه المجلة قريبًا. يمكن للمحرر إضافة الأقسام من لوحة التحكم.",
    tablistLabel: "أقسام شروط النشر",
    sectionsHeader: "الأقسام",
    mobileTablistLabel: "أقسام شروط النشر (موبايل)",
    sectionMeta: (current, total) => `القسم ${current} / ${total}`,
  },
};

const en: MagazineUiCopy = {
  meta: {
    magazine: "Journal",
    magazineIssue: "Journal issue",
    research: "Research",
    publishingConditions: "Publishing guidelines",
    versionsArchive: "Journal issues",
  },
  banner: {
    eyebrow: "Peer-reviewed journal",
    noDescription: "No short description is available for this journal.",
    coverAlt: (title) => `${title} cover`,
  },
  content: {
    impactFactor: "Impact factor",
    nextRelease: "Next issue",
    submitResearch: "Submit your research",
    publishingConditionsTitle: "Publishing guidelines",
    publishingConditionsSubtitle: (count) =>
      `Review ${count} ${count === 1 ? "section" : "sections"} of this journal's guidelines before you submit.`,
    publishingConditionsArrow: "→",
    aboutTitle: (title) => `About the journal: ${title}`,
    fieldsHeading: "Publication areas",
    defaultCategory: "Multidisciplinary",
    contactTitle: "Contact information",
    phone: "Phone",
    email: "Email",
    address: "Address",
    visionMissionTitle: "Vision & mission",
    vision: "Vision",
    mission: "Mission",
    defaultVision:
      "We aim to lead in publishing rigorous academic knowledge across the journal's fields of study.",
    defaultMission:
      "We support researchers through professional peer review and open-access content that reflects international quality standards.",
    accreditationTitle: "Indexing & accreditation",
    accreditationPlaceholder:
      "Indexing and accreditation details are updated by the editorial team. Contact us for inquiries.",
    statsTitle: "Journal statistics",
    statVersions: "Registered issues",
    statCurrentVersion: "Current issue",
    statNextRelease: "Next issue date",
    statImpactFactor: "Impact factor",
    emDash: "—",
  },
  advisors: {
    title: "Editorial board",
    intro: "Board members who approved publication for this journal",
  },
  versions: {
    title: "Journal issues",
    publishingConditions: "Publishing guidelines",
    fullArchive: "View full issues archive",
    chevron: "›",
    downloadMagazinePdf: "Download journal (PDF)",
    noMagazinePdf: "No PDF is available for this journal at the moment.",
    emptyVersions: "No issues have been registered for this journal yet.",
    issueBadge: (version) => `Issue ${version}`,
    releaseDate: (label) => `Release date: ${label}`,
    researchesCta: "Articles in this issue",
  },
  archive: {
    backToMagazine: "← Back to journal",
    versionsTitle: "Journal issues",
    emptyVersions: "No issues have been registered for this journal yet.",
    latestBadge: "Latest issue",
    researchesCta: "Articles in this issue",
    pageCountLink: (count) => `Page count (${count})`,
    downloadPdf: "Download PDF",
    pageCountPlain: (count) => `Page count (${count})`,
    unspecified: "Not specified",
  },
  versionHub: {
    backToMagazine: "← Back to journal",
    versionsArchive: "Issues archive",
    issueLabel: (version) => `Issue ${version}`,
    emptyResearches: "No articles have been registered for this issue yet.",
  },
  research: {
    backToResearches: "← Back to articles list",
    magazine: "Journal",
    issueLabel: (version) => `Issue ${version}`,
    summary: "Abstract",
    noSummary: "No abstract has been added for this article yet.",
    keywords: "Keywords:",
    noKeywords: "No keywords are listed for this article.",
    downloadPdf: "Download article (PDF)",
    externalLink: "Open original article page",
  },
  publishingConditionsPage: {
    backToMagazine: "← Back to journal",
    title: "Publishing guidelines",
    subtitle: "Learn the requirements and instructions to follow before submitting your work to the journal.",
  },
  publishingConditionsTabs: {
    emptyTitle: "No sections yet",
    emptyText:
      "Publishing guidelines for this journal will be published soon. Editors can add sections from the dashboard.",
    tablistLabel: "Publishing guideline sections",
    sectionsHeader: "Sections",
    mobileTablistLabel: "Publishing guideline sections (mobile)",
    sectionMeta: (current, total) => `Section ${current} / ${total}`,
  },
};

export function getMagazineUiCopy(locale: MagazineLocale): MagazineUiCopy {
  return locale === "en" ? en : ar;
}
