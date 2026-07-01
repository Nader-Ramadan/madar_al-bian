import type { Metadata } from "next";
import { SITE_PHONE_DISPLAY, SITE_WHATSAPP_URL } from "@/lib/site-contact";
import layout from "../page.module.css";
import staticStyles from "../static-page.module.css";

export const metadata: Metadata = {
  title: "Contact Us",
};

export default function ContactUsPage() {
  return (
    <div className={layout.page}>
      <main className={layout.main}>
        <section className={staticStyles.shell}>
          <h1 className={staticStyles.title}>اتصل بنا</h1>
          <p className={staticStyles.lead}>
            نحن هنا لمساعدتك في رحلتك البحثية. تواصل معنا للاستفسارات أو طلبات النشر.
          </p>
          <form className={staticStyles.form}>
            <div className={staticStyles.field}>
              <label className={staticStyles.label} htmlFor="contact-name">
                الاسم
              </label>
              <input id="contact-name" type="text" className={staticStyles.input} />
            </div>
            <div className={staticStyles.field}>
              <label className={staticStyles.label} htmlFor="contact-email">
                البريد الإلكتروني
              </label>
              <input id="contact-email" type="email" className={staticStyles.input} />
            </div>
            <div className={staticStyles.field}>
              <label className={staticStyles.label} htmlFor="contact-message">
                الرسالة
              </label>
              <textarea id="contact-message" rows={5} className={staticStyles.textarea} />
            </div>
            <button type="submit" className={staticStyles.staticSubmit}>
              إرسال الرسالة
            </button>
          </form>
          <div className={staticStyles.infoCard}>
            <h3>معلومات التواصل</h3>
            <p>القاهرة - مصر</p>
            <p>
              الهاتف:{" "}
              <a href={SITE_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                {SITE_PHONE_DISPLAY}
              </a>
            </p>
            <p>
              البريد: <a href="mailto:info@madaralbayan.com">info@madaralbayan.com</a>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
