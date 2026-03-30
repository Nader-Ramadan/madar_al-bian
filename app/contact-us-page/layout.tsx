import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "اتصل بنا - مؤسسة مدار البيان",
  description: "تواصل معنا للاستفسارات أو طلبات النشر العلمي",
};

export default function ContactUsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
