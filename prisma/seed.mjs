import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function syncMagazineVersionStats(magazineId) {
  const count = await prisma.magazineVersion.count({ where: { magazineId } });
  const latest = await prisma.magazineVersion.findFirst({
    where: { magazineId },
    orderBy: [{ releaseDate: "desc" }, { id: "desc" }],
  });
  await prisma.magazine.update({
    where: { id: magazineId },
    data: {
      versionCount: count,
      currentVersion: latest?.version ?? null,
    },
  });
}

const DUMMY_PDF =
  "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

/** Three interchangeable test rows per magazine (titles shortened for VarChar(255)). */
function testResearchTemplates(magazineLabel, slugPrefix) {
  const safeLabel = magazineLabel.slice(0, 120);
  const slug = slugPrefix.replace(/\s+/g, "-").slice(0, 48);
  return [
    {
      researcherNames: "د. أحمد محمود، د. سارة علي",
      title: `اختبار [١] — ${safeLabel}`,
      externalUrl: `https://example.com/research/${slug}-1`,
      summary:
        "ملخص تجريبي: استخدام هذا البحث لاختبار العرض في الواجهة وربط قاعدة البيانات. يمكن استبداله من لوحة التحكم.",
      keywords: "اختبار، قاعدة البيانات، المجلات العلمية",
      pdfUrl: DUMMY_PDF,
      sortOrder: 0,
    },
    {
      researcherNames: "أ.د. ليلى حسن",
      title: `اختبار [٢] — ${safeLabel}`,
      externalUrl: `https://example.com/research/${slug}-2`,
      summary:
        "ملخص ثانٍ للتحقق من قوائم البحوث وصفحة التفاصيل عند وجود عدة سجلات لنفس المجلة.",
      keywords: "البحث العلمي، الجودة، التجربة",
      pdfUrl: DUMMY_PDF,
      sortOrder: 1,
    },
    {
      researcherNames: "م. خالد يوسف، د. منى الزهراء",
      title: `اختبار [٣] — ${safeLabel}`,
      externalUrl: `https://example.com/research/${slug}-3`,
      summary:
        "ملخص ثالث مع كلمات مفتاحية وروابط خارجية للاختبار الشامل للواجهة.",
      keywords: "النشر، المجتمع الأكاديمي، السياسات",
      pdfUrl: DUMMY_PDF,
      sortOrder: 2,
    },
  ];
}

const seedMagazines = [
  {
    title: "مجلة مدار البيان — الدراسات العلمية (نموذج ١)",
    description:
      "مجلة محكّمة للدراسات العلمية والبحث التطبيقي؛ هذا سجل تجريبي لعرض الواجهة والبيانات الوصفية.",
    image: "/images/new-scientist.jpg",
    category: "العلوم التطبيقية",
    issn: "2950-0001",
    impactFactor: 2.412,
    nextVersionRelease: new Date("2026-09-15T00:00:00.000Z"),
    publicationPreference: "إصدار ربع سنوي؛ استلام المخطوطات حتى نهاية كل فصل.",
    versionMessage: "الإصدار ١.١ يتضمن ملحقًا خاصًا بالبحث الميداني.",
    certification: "معتمدة من الهيئة الوطنية للنشر (وهمية للعرض).",
    advisorsApproved: true,
    publishingAdvisors: [
      {
        photoUrl: "/images/new-scientist.jpg",
        name: "دكتورة رنا فتحي محمد العالول",
        jobTitle: "عميد كلية التربية، جامعة غزة، فلسطين",
      },
      {
        photoUrl: "/images/web.png",
        name: "أ.د. سعاد هادي حسن أرحيم الطائي",
        jobTitle: "أستاذة التاريخ الإسلامي، قسم التاريخ، كلية التربية، جامعة بغداد، العراق",
      },
      {
        photoUrl: "/images/The-Business-Magazine-Cover-Design.jpg",
        name: "أ.م.د. نيللي حسين كامل العمروسي",
        jobTitle:
          "أستاذ مشارك الصحة النفسية والإرشاد والعلاج النفسي، كلية التربية للبنات بأبها، جامعة الملك خالد",
      },
    ],
    versions: [
      {
        version: "1.0",
        title: "العدد الافتتاحي — نموذج ١",
        releaseDate: new Date("2025-03-01T00:00:00.000Z"),
        notes: "إصدار تجريبي.",
        pageCount: 24,
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        researches: [
          {
            researcherNames: "د. أحمد محمود، د. سارة علي",
            title: "بحث تجريبي — نمذجة البيانات في التعليم العالي",
            externalUrl: "https://example.com/research/placeholder-1",
            summary:
              "ملخص تجريبي قصير يمكن تعديله من لوحة التحكم. يصف الهدف العام للبحث والمنهج المقترح.",
            keywords: "التعليم العالي، البيانات، النمذجة، الذكاء الاصطناعي",
            pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            sortOrder: 0,
          },
          {
            researcherNames: "أ.د. ليلى حسن",
            title: "دراسة استطلاعية — جودة البحث العلمي بين الطلبة",
            externalUrl: "https://example.com/research/placeholder-2",
            summary:
              "نص تجريبي ثانٍ لصفحة البحث على الموقع؛ استخدم زر التحرير في لوحة التحكم لتحديث المحتوى.",
            keywords: "البحث العلمي، الطلبة، الجودة، الاستبيان",
            pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            sortOrder: 1,
          },
          {
            researcherNames: "م. خالد يوسف، د. منى الزهراء",
            title: "تحليل مقارن — سياسات النشر المفتوح في المنطقة",
            externalUrl: "https://example.com/research/placeholder-3",
            summary: "بحث نموذجي ثالث مع رابط خارجي؛ عدّل العناوين والأسماء والروابط من قسم الإصدارات.",
            keywords: "النشر المفتوح، المنطقة العربية، السياسات، المجلات",
            pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            sortOrder: 2,
          },
        ],
      },
      {
        version: "1.1",
        title: "تحديث الربيع — نموذج ١",
        releaseDate: new Date("2025-06-10T00:00:00.000Z"),
        notes: "إضافة مقالات مراجعة الأقران.",
        pageCount: 32,
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      },
    ],
  },
  {
    title: "مجلة مدار البيان — الإنسانيات والمجتمع (نموذج ٢)",
    description:
      "فضاء للدراسات الإنسانية والاجتماعية؛ بيانات وهمية لاختبار بطاقات العرض والروابط.",
    image: "/images/web.png",
    category: "الإنسانيات",
    issn: "2950-0002",
    impactFactor: 1.085,
    nextVersionRelease: new Date("2026-11-01T00:00:00.000Z"),
    publicationPreference: "عددان سنويان؛ الموعد النهائي للتقديم ١ مارس و١ أغسطس.",
    versionMessage: "العدد القادم يخصص ملفًا عن التعليم العالي.",
    certification: "شهادة جودة محتوى (عرض).",
    advisorsApproved: false,
    versions: [
      {
        version: "2025-A",
        title: "ملف المدن الذكية",
        releaseDate: new Date("2025-01-20T00:00:00.000Z"),
        notes: null,
        researches: testResearchTemplates(
          "مجلة مدار البيان — الإنسانيات والمجتمع (نموذج ٢)",
          "hum-test",
        ),
      },
    ],
  },
  {
    title: "مجلة مدار البيان — الاقتصاد والسياسات (نموذج ٣)",
    description:
      "دراسات اقتصادية وسياسات عامة؛ محتوى تجريبي لربط واجهة المجلات بقاعدة البيانات.",
    image: "/images/The-Business-Magazine-Cover-Design.jpg",
    category: "الاقتصاد والسياسة",
    issn: "2950-0003",
    impactFactor: 3.201,
    nextVersionRelease: new Date("2027-01-10T00:00:00.000Z"),
    publicationPreference: "إصدار سنوي؛ التحكيم المزدوج السري.",
    versionMessage: "نسخة خاصة بالتمويل الأخضر قيد التحضير.",
    certification: "فهرسة في قواعد بيانات وهمية للعرض.",
    advisorsApproved: true,
    versions: [
      {
        version: "v1",
        title: "العدد الأول — نموذج ٣",
        releaseDate: new Date("2024-11-05T00:00:00.000Z"),
        notes: "بيانات تجريبية.",
      },
      {
        version: "v2",
        title: "العدد الثاني — نموذج ٣",
        releaseDate: new Date("2025-04-18T00:00:00.000Z"),
        notes: "تحديث السياسات العامة.",
        researches: testResearchTemplates(
          "مجلة مدار البيان — الاقتصاد والسياسات (نموذج ٣)",
          "econ-test",
        ),
      },
    ],
  },
];

/** If the first seed magazine/version exists but has no researches, add the same 3 placeholders (idempotent). */
async function ensurePlaceholderResearchesForExistingDb() {
  const templateMag = seedMagazines[0];
  const templateVer = templateMag.versions.find((x) => x.version === "1.0");
  const templateResearches = templateVer?.researches;
  if (!templateResearches?.length) return;

  const magazine = await prisma.magazine.findFirst({ where: { title: templateMag.title } });
  if (!magazine) return;

  const version = await prisma.magazineVersion.findFirst({
    where: { magazineId: magazine.id, version: "1.0" },
    select: { id: true },
  });
  if (!version) return;

  const existing = await prisma.magazineVersionResearch.count({
    where: { magazineVersionId: version.id },
  });
  if (existing > 0) return;

  let order = 0;
  for (const r of templateResearches) {
    await prisma.magazineVersionResearch.create({
      data: {
        magazineVersionId: version.id,
        researcherNames: r.researcherNames,
        title: r.title,
        externalUrl: r.externalUrl,
        summary: r.summary ?? null,
        keywords: r.keywords ?? null,
        pdfUrl: r.pdfUrl ?? null,
        sortOrder: r.sortOrder ?? order++,
      },
    });
  }
  console.log(`Added placeholder researches to existing magazine "${templateMag.title}" version 1.0`);
}

/**
 * Ensure each magazine has at least 3 researches on its latest version (by releaseDate).
 * Idempotent: only creates rows when count is below 3.
 */
async function ensureThreeResearchesPerMagazine() {
  const magazines = await prisma.magazine.findMany({
    select: { id: true, title: true },
  });

  for (const mag of magazines) {
    const version = await prisma.magazineVersion.findFirst({
      where: { magazineId: mag.id },
      orderBy: [{ releaseDate: "desc" }, { id: "desc" }],
    });
    if (!version) continue;

    const count = await prisma.magazineVersionResearch.count({
      where: { magazineVersionId: version.id },
    });
    const need = Math.max(0, 3 - count);
    const templates = testResearchTemplates(mag.title, `mag-${mag.id}`);
    for (let i = 0; i < need; i++) {
      const r = templates[count + i];
      await prisma.magazineVersionResearch.create({
        data: {
          magazineVersionId: version.id,
          researcherNames: r.researcherNames,
          title: r.title,
          externalUrl: r.externalUrl,
          summary: r.summary ?? null,
          keywords: r.keywords ?? null,
          pdfUrl: r.pdfUrl ?? null,
          sortOrder: count + i,
        },
      });
    }
    if (need > 0) {
      console.log(
        `Ensured ${need} test research(es) on latest version of magazine id=${mag.id} (${mag.title.slice(0, 48)}…)`,
      );
    }
  }
}

async function main() {
  for (const row of seedMagazines) {
    const existing = await prisma.magazine.findFirst({ where: { title: row.title } });
    if (existing) {
      console.log(`Skip (exists): ${row.title}`);
      continue;
    }

    const { versions, publishingAdvisors, ...magazineData } = row;
    const magazine = await prisma.magazine.create({
      data: {
        ...magazineData,
        versionCount: 0,
        currentVersion: null,
      },
    });

    const advisors = publishingAdvisors ?? [];
    for (let i = 0; i < advisors.length; i++) {
      const pa = advisors[i];
      await prisma.magazineAdvisor.create({
        data: {
          magazineId: magazine.id,
          photoUrl: pa.photoUrl,
          name: pa.name,
          jobTitle: pa.jobTitle,
          sortOrder: i,
        },
      });
    }

    for (const v of versions) {
      const { researches: versionResearches = [], ...versionFields } = v;
      const createdVersion = await prisma.magazineVersion.create({
        data: {
          magazineId: magazine.id,
          version: versionFields.version,
          title: versionFields.title,
          releaseDate: versionFields.releaseDate,
          notes: versionFields.notes ?? null,
          pageCount: versionFields.pageCount ?? null,
          pdfUrl: versionFields.pdfUrl ?? null,
        },
      });
      let order = 0;
      for (const r of versionResearches) {
        await prisma.magazineVersionResearch.create({
          data: {
            magazineVersionId: createdVersion.id,
            researcherNames: r.researcherNames,
            title: r.title,
            externalUrl: r.externalUrl,
            summary: r.summary ?? null,
            keywords: r.keywords ?? null,
            pdfUrl: r.pdfUrl ?? null,
            sortOrder: r.sortOrder ?? order++,
          },
        });
      }
    }

    await syncMagazineVersionStats(magazine.id);
    console.log(`Seeded: ${row.title} (id=${magazine.id})`);
  }

  await ensurePlaceholderResearchesForExistingDb();
  await ensureThreeResearchesPerMagazine();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
