'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from '../page.module.css';

const faqItems = [
  {
    question: 'ما المدة الزمنية المتوقعة لعملية التحكيم والمراجعة؟',
    answer: "نود الإفادة بأن مدة التحكيم والمراجعة تستغرق عادةً  اسبوع من تاريخ التقديم.",
  },
  {
    question: 'هل تتيح المؤسسة نشر الكتب؟',
    answer: "توفر المؤسسة فرصًا متميزة لنشر الكتب العلمية، سواءً كانت كاملة أو في صورة أجزاء، بما يشمل الرسائل العلمية وفصول الكتب. كما تستقبل المؤسسة البحوث العلمية، والمقالات الأكاديمية، وأعمال الترجمة، وفق أعلى معايير النشر، بما يضمن جودة المحتوى وانتشاره.",
  },
  {
    question: 'هل يمكن الحصول على خطاب بقبول النشر؟',
    answer: 'يُصدر خطاب رسمي بقبول النشر بعد إتمام كافة إجراءات المراجعة والتحكيم المطلوبة من قبل المحكم المسؤول عن دراستك. كما يمكن توفير إفادة رسمية تثبت نشر البحث بعد نشره فعليًا على الموقع الإلكتروني للمؤسسة، لتكون مرجعًا رسميًا لعملية النشر.',
  },
  {
    question: 'هل تقدمون دعمًا بعد النشر؟',
    answer: 'بالتأكيد، يقدم فريق المؤسسة دعمًا كاملًا بعد نشر البحث، يشمل الفهرسة في قواعد البيانات الأكاديمية لضمان ظهور البحث في مختلف المصادر العلمية، وإصدار رقم DOI (Digital Object Identifier) وهو رقم معرف دولي شامل وفريد يضمن توثيق البحث بشكل رسمي وسهل التتبع والاستشهاد به.كما يتضمن الدعم الترويج للبحث عبر قنوات المؤسسة المختلفة، ونشره على الشبكات العلمية والاجتماعية، وتقديم المشورة لكيفية زيادة وصول البحث وانتشاره وتأثيره في المجتمع العلمي، بالإضافة إلى إمكانية المساعدة في الاشتراك في المؤتمرات العلمية والأنشطة الأكاديمية لتعزيز ظهور البحث والمؤلفين على نطاق أوسع.',
  },
  {
    question: 'هل يمكن نشر البحث بلغات أخرى غير اللغة العربية؟',
    answer: 'نعم، تتيح المؤسسة نشر الأبحاث بعدة لغات، بما يشمل اللغة الإنجليزية أو أي لغة علمية أخرى، وذلك وفق معايير النشر المعتمدة لضمان الجودة الأكاديمية وسهولة الوصول للباحثين على المستوى الدولي.كما يتم مراجعة جميع النسخ للتأكد من دقتها اللغوية والمصطلحية قبل النشر.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className={styles.faqSection}>
      <div className={styles.faqGrid}>
        <div className={styles.faqList}>
          <h2>الأسئلة الشائعة</h2>
          {faqItems.map((item, idx) => (
            <div key={idx} className={`${styles.faqItem} ${openIndex === idx ? styles.open : ''}`}>
              <button
                type='button'
                className={styles.faqQuestion}
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              >
                <span>{item.question}</span>
                <span className={styles.faqToggle}>{openIndex === idx ? '−' : '+'}</span>
              </button>
              <p className={styles.faqAnswer}>{item.answer}</p>
            </div>
          ))}
        </div>

        <aside className={styles.faqSide}>
        <div className={styles.faqIcon}>
            <Image
                src="../Icons/1000001545.svg" alt="هل لديك سؤال؟"
                width={120}
                height={120} />
            </div>
          <h3>هل لديك سؤال؟</h3>
          <p>يمكنك إرسال أي استفسار ترغب في معرفته وسنرد عليك بسرعة.</p>
          <form className={styles.faqForm} onSubmit={(e) => e.preventDefault()}>
            <label htmlFor='faq-input'>أخبرنا</label>
            <div className={styles.faqInputWrapper}>
              <input id='faq-input' type='text' placeholder='اكتب هنا' />
              <button type='submit'>إرسال</button>
            </div>
          </form>
        </aside>
      </div>
    </section>
  );
}
