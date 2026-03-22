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
                    <a href="#">الرئيسية</a>
                </li>
                <li>
                    <a href="/magazines-page">كل المجلات</a>
                </li>
                <li>
                    <a href="#">اللجنة الاستشارية</a>
                </li>
                <li>
                    <a href="#">طلب نشر دراسة</a>
                </li>
                <li>
                    <a href="#">المؤتمرات</a>
                </li>
                <li>
                    <a href="#">المدونة</a>
                </li>
                <li>
                    <a href="#">من نحن</a>
                </li>
                <li>
                    <a href="#">اتصل بنا</a>
                </li>
            </ul>
            <button></button>
        </nav>
    );
}
export default navBar;