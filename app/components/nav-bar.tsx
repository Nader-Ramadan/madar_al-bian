"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from "next/navigation";

function NavBar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

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

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        setIsAdmin(false);
        router.push("/");
        router.refresh();
    };

    return (
        <nav className="nav-bar">
            <div className="nav-brand">
                <Link href="/">
                    <Image
                        src="/images/logo/horizontal-logo/svg-horizontal-main-logo-transparent.svg"
                        alt="Logo"
                        width={150}
                        height={50}
                    />
                </Link>
            </div>

            <button
                className={`nav-toggle ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
                type="button"
            >
                <span className="bar" />
                <span className="bar" />
                <span className="bar" />
            </button>

            <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
                <li>
                    <Link href="/">الرئيسية</Link>
                </li>
                <li>
                    <Link href="/magazines">كل المجلات</Link>
                </li>
                <li>
                    <Link href="/advisory-committee">اللجنة الاستشارية</Link>
                </li>
                <li>
                    <Link href="/request-for-publication-of-a-study">طلب نشر دراسة</Link>
                </li>
                <li>
                    <Link href="/conferences">المؤتمرات</Link>
                </li>
                <li>
                    <Link href="/blog">المدونة</Link>
                </li>
                <li>
                    <Link href="/about-us">من نحن</Link>
                </li>
                <li>
                    <Link href="/contact-us">اتصل بنا</Link>
                </li>
                {isAdmin ? (
                    <>
                        <li className="nav-links__push">
                            <Link href="/admin">مساحة العمل</Link>
                        </li>
                        <li>
                            <Link href="/admin/magazines">المجلات والإصدارات</Link>
                        </li>
                        <li>
                            <button
                                type="button"
                                className="nav-logout-button"
                                onClick={handleLogout}
                            >
                                تسجيل الخروج
                            </button>
                        </li>
                    </>
                ) : (
                    <li className="nav-links__login">
                        <Link href="/login" className="nav-login-pill">
                            تسجيل الدخول
                        </Link>
                    </li>
                )}
            </ul>
        </nav>
    );
}
export default NavBar;
