import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "المدونة - مؤسسة مدار البيان",
  description: "مقالات ونصائح قيمة للباحثين في النشر العلمي.",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
