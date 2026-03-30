import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "من نحن - مؤسسة مدار البيان",
  description: "تعرف على مؤسسة مدار البيان للنشر العلمي وخدماتنا.",
};

export default function AboutUsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
