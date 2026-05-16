"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "الرئيسية" },
  { href: "/magazines", label: "كل المجلات" },
  { href: "/advisory-committee", label: "اللجنة الاستشارية" },
  { href: "/request-for-publication-of-a-study", label: "طلب نشر دراسة" },
  { href: "/conferences", label: "المؤتمرات" },
  { href: "/blog", label: "المدونة" },
  { href: "/about-us", label: "من نحن" },
  { href: "/contact-us", label: "اتصل بنا" },
] as const;

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const closeMenu = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const payload = await response.json();
        setIsAdmin(Boolean(payload?.success && payload?.data?.role === "ADMIN"));
      } catch {
        setIsAdmin(false);
      }
    };
    loadSession();
  }, []);

  useEffect(() => {
    // Close mobile drawer after client-side navigation (links also call closeMenu).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional menu reset on route change
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeMenu]);

  const handleLogout = async () => {
    closeMenu();
    await fetch("/api/auth/logout", { method: "POST" });
    setIsAdmin(false);
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="nav-bar">
      <div className="nav-brand">
        <Link href="/" onClick={closeMenu}>
          <Image
            src="/images/logo/horizontal-logo/svg-horizontal-main-logo-transparent.svg"
            alt="Logo"
            width={150}
            height={50}
          />
        </Link>
      </div>

      <button
        className={`nav-toggle ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "إغلاق القائمة" : "فتح القائمة"}
        aria-expanded={isOpen}
        aria-controls="site-nav-drawer"
        type="button"
      >
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </button>

      {isOpen ? (
        <button
          type="button"
          className="nav-backdrop"
          aria-label="إغلاق القائمة"
          onClick={closeMenu}
        />
      ) : null}

      <ul id="site-nav-drawer" className={`nav-links ${isOpen ? "open" : ""}`}>
        <li className="nav-drawer-head">القائمة</li>
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <Link href={item.href} onClick={closeMenu}>
              {item.label}
            </Link>
          </li>
        ))}
        {isAdmin ? (
          <>
            <li className="nav-links__divider" role="presentation" />
            <li className="nav-links__push">
              <Link href="/admin" onClick={closeMenu}>
                مساحة العمل
              </Link>
            </li>
            <li>
              <Link href="/admin/magazines" onClick={closeMenu}>
                المجلات والإصدارات
              </Link>
            </li>
            <li>
              <button type="button" className="nav-logout-button" onClick={handleLogout}>
                تسجيل الخروج
              </button>
            </li>
          </>
        ) : null}
      </ul>
    </nav>
  );
}
