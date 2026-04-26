"use client";

import styles from "../page.module.css";
import Image from 'next/image';

function MagazineContent() {
  return (
    <div className={styles.magazineContent}>
      <section className={styles.author}>
        <span className={styles.divider}></span>
        <div className={styles.authorDetails}>
          <div className={styles.authorImage}>
            <Image
              src="/images/author.jpg"
              width={100}
              height={100}
              alt="Author"
            />
          </div>
          <div className={styles.authorInfo}>
        <div>
          <div className={styles.subtit}>ISSN</div>
          <div className={styles.tit}>00/00/0000</div>
        </div>
            <div className={styles.subtit}>الوظيفة</div>
            <div className={styles.tit}>أسم الناشر</div>
          </div>
        </div>
        <div>
          <div className={styles.subtit}>تاريخ الاصدار</div>
          <div className={styles.tit}>00/00/0000</div>
        </div>
        <div>
          <div className={styles.subtit}>تاريخ الاصدار القادم</div>
          <div className={styles.tit}>00/00/0000</div>
        </div>
        <div>
          <div className={styles.subtit}>عدد الصفحات</div>
          <div className={styles.tit}>00 صفحة</div>
        </div>
        <div className={styles.authorActions}>
          <button className={styles.downloadBtn}>تحميل PDF <span>(00MB)</span></button>
          <button className={styles.shareBtn}>مشاركة</button>
        </div>
      </section>
      <section className={styles.magSum}>
        <span className={styles.divider}></span>
        <h2>ملخص المجلة</h2>
        <p>
          لوريم إيبسوم هو ببساطة نص شكلي (بمعنى أن الغاية هي الشكل وليس المحتوى) ويُستخدم في صناعات الطباعة والتنضيد. كان لوريم إيبسوم هو النص الوهمي القياسي منذ القرن الخامس عشر، عندما أخذت مطبعة غير معروفة مجموعة من الأحرف وخلطتها لتكوين كتاب عينة. لقد نجت ليس فقط خمسة قرون، بل أيضًا قفزة إلى التنضيد الإلكتروني، وظلت دون تغيير جوهري.
        </p>
        <p>
          لوريم إيبسوم هو ببساطة نص شكلي (بمعنى أن الغاية هي الشكل وليس المحتوى) ويُستخدم في صناعات الطباعة والتنضيد. كان لوريم إيبسوم هو النص الوهمي القياسي منذ القرن الخامس عشر، عندما أخذت مطبعة غير معروفة مجموعة من الأحرف وخلطتها لتكوين كتاب عينة. لقد نجت ليس فقط خمسة قرون، بل أيضًا قفزة إلى التنضيد الإلكتروني، وظلت دون تغيير جوهري.
        </p>
        <p>
          لوريم إيبسوم هو ببساطة نص شكلي (بمعنى أن الغاية هي الشكل وليس المحتوى) ويُستخدم في صناعات الطباعة والتنضيد. كان لوريم إيبسوم هو النص الوهمي القياسي منذ القرن الخامس عشر، عندما أخذت مطبعة غير معروفة مجموعة من الأحرف وخلطتها لتكوين كتاب عينة. لقد نجت ليس فقط خمسة قرون، بل أيضًا قفزة إلى التنضيد الإلكتروني، وظلت دون تغيير جوهري.
        </p>
      </section>
    </div>
  );
}
export default MagazineContent;