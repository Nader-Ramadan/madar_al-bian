"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

function NavBar() {
    const [isOpen, setIsOpen] = useState(false);

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
                    <Link href="/all-fields-page">كل المجلات</Link>
                </li>
                <li>
                    <Link href="/advisory-committee-page">اللجنة الاستشارية</Link>
                </li>
                <li>
                    <Link href="/request-for-publication-of-a-study-page">طلب نشر دراسة</Link>
                </li>
                <li>
                    <Link href="/conferences-page">المؤتمرات</Link>
                </li>
                <li>
                    <Link href="/blog-page">المدونة</Link>
                </li>
                <li>
                    <Link href="/about-us-page">من نحن</Link>
                </li>
                <li>
                    <Link href="/contact-us-page">اتصل بنا</Link>
                </li>
            </ul>
        </nav>
    );
}
export default NavBar;
