import { prisma } from "@/lib/prisma";

/** Recompute versionCount and currentVersion from MagazineVersion rows. */
export async function syncMagazineVersionStats(magazineId: number) {
  const [count, latest] = await Promise.all([
    prisma.magazineVersion.count({ where: { magazineId } }),
    prisma.magazineVersion.findFirst({
      where: { magazineId },
      orderBy: [{ releaseDate: "desc" }, { id: "desc" }],
    }),
  ]);
  await prisma.magazine.update({
    where: { id: magazineId },
    data: {
      versionCount: count,
      currentVersion: latest?.version ?? null,
    },
  });
}
