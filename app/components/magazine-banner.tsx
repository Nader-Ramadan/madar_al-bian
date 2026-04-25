"use client";

import styles from '../page.module.css';
import Image from 'next/image';

function magazineBanner() {
    return (
        <div className={styles.magazineBanner}>
            <div className={styles.magazineCover}>
                <Image
                    src="/images/new-scientist.jpg"
                    width={300}
                    height={400}
                    alt="Magazine Cover"
                />
                </div>
            <div className={styles.magazinetitle}>
                <h1>**أسم المجلة**</h1>
                <h3> لوريم إيبسوم هو ببساطة نص شكلي (بمعنى أن الغاية هي الشكل وليس المحتوى) ويُستخدم في صناعات الطباعة والتنضيد. كان لوريم إيبسوم هو النص الوهمي القياسي منذ القرن الخامس عشر، عندما أخذت مطبعة غير معروفة مجموعة من الأحرف وخلطتها لتكوين كتاب عينة. لقد نجت ليس فقط خمسة قرون، بل أيضًا قفزة إلى التنضيد الإلكتروني، وظلت دون تغيير جوهري.</h3>
            </div>
        </div>
    );
}
export default magazineBanner;