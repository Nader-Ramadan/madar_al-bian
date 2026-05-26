import { notFound } from "next/navigation";
import { parseMagazineId } from "@/lib/magazine-id";
import { getMagazinePageContext } from "@/lib/magazine-page-context";

export default async function MagazineIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const magazineId = parseMagazineId(rawId);
  if (!magazineId) notFound();

  const ctx = await getMagazinePageContext(magazineId);
  if (!ctx) notFound();

  return (
    <div dir={ctx.dir} lang={ctx.locale}>
      {children}
    </div>
  );
}
