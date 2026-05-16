"use client";

import Image from "next/image";
import Link from "next/link";
import {
  IconContact,
  IconFacebook,
  IconHelpCircle,
  IconInstagram,
  IconLink,
  IconMail,
  IconMapPin,
  IconPhone,
  IconTwitter,
  IconYoutube,
} from "./footer-icons";

/** Paste your profile URLs here when ready. Use "#" to keep a non-navigating placeholder. */
const SOCIAL_LINKS = {
  youtube: "#",
  twitter: "#",
  instagram: "#",
  facebook: "#",
} as const;

const CONTACT = {
  address: "٢٠٣ شارع ماونتن فيو، الجيزة، جمهورية مصر العربية",
  phoneDisplay: "٠٠٢ +١٠٦٦٢٢٣٣٩٩",
  phoneHref: "tel:+201066223399",
  emailDisplay: "info@madar-albian.com",
  emailHref: "mailto:info@madar-albian.com",
} as const;

const SOCIAL_ITEMS = [
  { key: "youtube" as const, label: "يوتيوب", Icon: IconYoutube },
  { key: "twitter" as const, label: "تويتر", Icon: IconTwitter },
  { key: "instagram" as const, label: "إنستغرام", Icon: IconInstagram },
  { key: "facebook" as const, label: "فيسبوك", Icon: IconFacebook },
];

function externalLinkProps(url: string) {
  if (url === "#") {
    return { href: "#" as const };
  }
  return {
    href: url,
    target: "_blank" as const,
    rel: "noopener noreferrer" as const,
  };
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footerContent">
        <div className="footerBrand">
          <Link href="/" className="footerLogoLink">
            <Image
              className="logo"
              src="/images/logo/horizontal-logo/svg-horizontal-white-logo-transparent.svg"
              alt="مؤسسة مدار البيان للنشر العلمي"
              width={180}
              height={60}
            />
          </Link>
          <p className="footerTagline">
            شريكك الموثوق في النشر العلمي المحكّم والمؤتمرات الأكاديمية الدولية
          </p>
          <div className="footerSocials">
            {SOCIAL_ITEMS.map(({ key, label, Icon }) => {
              const url = SOCIAL_LINKS[key];
              return (
                <a key={key} {...externalLinkProps(url)} aria-label={label}>
                  <Icon />
                </a>
              );
            })}
          </div>
        </div>

        <div className="footerSection">
          <h4 className="footerSectionTitle">
            <IconLink />
            <span>روابط سريعة</span>
          </h4>
          <nav className="footerNav" aria-label="روابط سريعة">
            <Link href="/magazines">مجلاتنا</Link>
            <Link href="/conferences">المؤتمرات</Link>
            <Link href="/request-for-publication-of-a-study">طلب نشر دراسة</Link>
            <Link href="/contact-us">اتصل بنا</Link>
          </nav>
        </div>

        <div className="footerSection">
          <h4 className="footerSectionTitle">
            <IconHelpCircle />
            <span>مساعدة</span>
          </h4>
          <nav className="footerNav" aria-label="مساعدة">
            <Link href="/#faq">الأسئلة الشائعة</Link>
            <Link href="/terms">الشروط والأحكام</Link>
            <Link href="/privacy">سياسة الخصوصية</Link>
          </nav>
        </div>

        <div className="footerSection footerSectionContact">
          <h4 className="footerSectionTitle">
            <IconContact />
            <span>تواصل معنا</span>
          </h4>
          <ul className="footerContactList">
            <li className="footerContactItem">
              <span className="footerContactIcon" aria-hidden="true">
                <IconMapPin />
              </span>
              <span>{CONTACT.address}</span>
            </li>
            <li className="footerContactItem">
              <span className="footerContactIcon" aria-hidden="true">
                <IconPhone />
              </span>
              <a href={CONTACT.phoneHref}>{CONTACT.phoneDisplay}</a>
            </li>
            <li className="footerContactItem">
              <span className="footerContactIcon" aria-hidden="true">
                <IconMail />
              </span>
              <a href={CONTACT.emailHref}>{CONTACT.emailDisplay}</a>
            </li>
          </ul>
        </div>

        <p className="footerCopy">
          جميع الحقوق محفوظة © 2026 مؤسسة مدار البيان للنشر العلمي
        </p>
      </div>
    </footer>
  );
}
