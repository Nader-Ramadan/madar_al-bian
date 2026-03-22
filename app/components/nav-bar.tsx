/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useState } from 'react';
import Image from 'next/image';

function navBar() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="nav-bar">
            <div className="nav-brand">
                <a href="/">
                    <Image
                        src="/images/logo/horizontal-logo/svg-horizontal-main-logo-transparent.svg"
                        alt="Logo"
                        width={150}
                        height={50}
                    />
                </a>
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
                    <a href="/">الرئيسية</a>
                </li>
                <li>
                    <a href="/magazines-page">كل المجلات</a>
                </li>
                <li>
                    <a href="/advisory-committee-page">اللجنة الاستشارية</a>
                </li>
                <li>
                    <a href="/request-for-publication-of-a-study-page">طلب نشر دراسة</a>
                </li>
                <li>
                    <a href="/conferences-page">المؤتمرات</a>
                </li>
                <li>
                    <a href="/blog-page">المدونة</a>
                </li>
                <li>
                    <a href="/about-us-page">من نحن</a>
                </li>
                <li>
                    <a href="/contact-us-page">اتصل بنا</a>
                </li>
            </ul>
            <button></button>
        </nav>
    );
}
export default navBar;