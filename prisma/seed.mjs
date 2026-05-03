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
    versions: [
      {
        version: "1.0",
        title: "العدد الافتتاحي — نموذج ١",
        releaseDate: new Date("2025-03-01T00:00:00.000Z"),
        notes: "إصدار تجريبي.",
      },
      {
        version: "1.1",
        title: "تحديث الربيع — نموذج ١",
        releaseDate: new Date("2025-06-10T00:00:00.000Z"),
        notes: "إضافة مقالات مراجعة الأقران.",
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
      },
    ],
  },
];

async function main() {
  for (const row of seedMagazines) {
    const existing = await prisma.magazine.findFirst({ where: { title: row.title } });
    if (existing) {
      console.log(`Skip (exists): ${row.title}`);
      continue;
    }

    const { versions, ...magazineData } = row;
    const magazine = await prisma.magazine.create({
      data: {
        ...magazineData,
        versionCount: 0,
        currentVersion: null,
      },
    });

    for (const v of versions) {
      await prisma.magazineVersion.create({
        data: {
          magazineId: magazine.id,
          version: v.version,
          title: v.title,
          releaseDate: v.releaseDate,
          notes: v.notes ?? null,
        },
      });
    }

    await syncMagazineVersionStats(magazine.id);
    console.log(`Seeded: ${row.title} (id=${magazine.id})`);
  }
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
