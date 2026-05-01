import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "طلب نشر دراسة",
};

export default function RequestPublicationLayout({ children }: { children: ReactNode }) {
  return children;
}
