import Image from 'next/image';
import styles from '../page.module.css';

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerBrand}>
          
          <div className={styles.footerSocials}>
            <a href="#" aria-label="يوتيوب">YT</a>
            <a href="#" aria-label="تويتر">TW</a>
            <a href="#" aria-label="إنستغرام">IG</a>
            <a href="#" aria-label="فيسبوك">FB</a>
          </div>
        </div>

        <div className={styles.footerSection}>
          <h4>المؤتمرات</h4>
          <a href="/magazines">مجلاتنا</a>
          <a href="/conference">المؤتمرات</a>
          <a href="/submit-research">طلب نشر دراسة</a>
        </div>

        <div className={styles.footerSection}>
          <h4>مساعدة</h4>
          <a href="/faq">الأسئلة الشائعة</a>
          <a href="/terms">الشروط والأحكام</a>
          <a href="/privacy">سياسة الخصوصية</a>
        </div>

        <div className={styles.footerSection}>
          <h4>تواصل معنا</h4>
          <p>٢٠٣ شارع ماونتن فيو، الجيزة</p>
          <p>٠٠٢ +١٠٦٦٢٢٣٣٩٩</p>
          <p>info@soudemy.com</p>
        </div>
        <Image
            className="logo"
            src="/images/logo/horizontal-logo/svg-horizontal-white-logo-transparent.svg"
            alt="Madar Al-Bian logo"
            width={180}
            height={60}
        />
        <p className={styles.footerCopy}>
          جميع الحقوق محفوظة © 2026 مؤسسسة مدار البيان للنشر العلمي
        </p>
      </div>
      
    </footer>
  );
}

export default Footer;