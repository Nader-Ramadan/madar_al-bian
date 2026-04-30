import styles from "../../page.module.css";
import MagazineBanner from "../../components/magazine-banner";
import MagazineContent from "../../components/magazine-content";
import MagazineVersions from "../../components/magazines-versions";
import { prisma } from "@/lib/prisma";

async function MagazinePage({ params }: { params: Promise<{ magazine: string }> }) {
  const { magazine } = await params;
  const decodedTitle = decodeURIComponent(magazine);
  const magazineRecord = await prisma.magazine.findFirst({
    where: { title: { contains: decodedTitle } },
  });

  return (
    <div className={styles.page}>
        <MagazineBanner title={decodedTitle} magazineId={magazineRecord?.id} />
        <MagazineContent />
        <MagazineVersions />
    </div>
  );
}
export default MagazinePage;