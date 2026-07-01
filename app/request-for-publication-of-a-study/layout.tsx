import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "طلب نشر دراسة",
};

export default function RequestPublicationLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>جاري التحميل…</div>}>
      {children}
    </Suspense>
  );
}
