'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from '../page.module.css';

const faqItems = [
  {
    question: 'كم من الوقت يستغرق تسليم مسودة البحث الأولى؟',
    answer: 'عادةً ما نسلم المسودة الأولى خلال 7 أيام من تقديم البحث وتأكيد المتطلبات.',
  },
  {
    question: 'هل تقدمون دعمًا بعد النشر؟',
    answer: 'نعم، فريقنا يدعم الفهرسة، تسجيل DOI، والترويج بعد النشر.',
  },
  {
    question: 'هل يمكنني طلب مجلة محددة للنشر؟',
    answer: 'بالطبع، نتعاون مع شبكة واسعة من المجلات المحكمة ويمكننا التكيف مع تفضيلاتك.',
  },
  {
    question: 'كيف تُدار عملية التحكيم العلمي؟',
    answer: 'يدير فريق التحرير لدينا التحكيم، تتبع المراجعات، وضمان الجودة من التقديم حتى القبول.',
  },
  {
    question: 'ما هي الأسعار وشروط الدفع؟',
    answer: 'نقدم أسعارًا شفافة مع مراحل الدفع وخيارات متنوعة للدفع.',
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
