import type { Metadata } from "next";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Contact Us",
};  

export default function ContactUsPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section style={{padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'right' as const, direction: 'rtl' as const}}>
          <h1 style={{fontSize: '3rem', fontWeight: '900', color: 'var(--secondary-color)', marginBottom: '1rem'}}>اتصل بنا</h1>
          <p style={{fontSize: '1.2rem', lineHeight: '1.6', color: 'var(--text-muted)', marginBottom: '2rem'}}>
            نحن هنا لمساعدتك في رحلتك البحثية. تواصل معنا للاستفسارات أو طلبات النشر.
          </p>
          <form style={{display: 'grid', gap: '1.5rem'}}>
            <div>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>الاسم</label>
              <input type="text" style={{width: '100%', padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: '0.5rem'}} />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>البريد الإلكتروني</label>
              <input type="email" style={{width: '100%', padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: '0.5rem'}} />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>الرسالة</label>
              <textarea rows={5} style={{width: '100%', padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: '0.5rem'}}></textarea>
            </div>
            <button type="submit" style={{background: 'var(--primary-color)', color: 'var(--secondary-color)', padding: '1rem 2rem', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer'}}>إرسال الرسالة</button>
          </form>
          <div style={{marginTop: '3rem', padding: '2rem', background: 'var(--secondary-color)', color: 'white', borderRadius: '1rem'}}>
            <h3 style={{marginBottom: '1rem'}}>معلومات التواصل</h3>
            <p>العنوان: ٢٠٣ شارع ماونتن فيو، الجيزة</p>
            <p>الهاتف: ٠٠٢ +١٠٦٦٢٢٣٣٩٩</p>
            <p>البريد: info@madar-albian.com</p>
          </div>
        </section>
      </main>
    </div>
  );
}
