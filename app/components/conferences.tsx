"use client";
import styles from '../page.module.css';
import { useEffect, useState } from "react";

export default function Conferences() {
  const [upcoming, setUpcoming] = useState<Array<{
    id: number;
    title: string;
    description: string;
    date: string;
    location: string;
    attendees?: string | null;
    image?: string | null;
  }>>([]);

  const stats = [
    { title: '+3000', desc: 'باحث مشارك' },
    { title: '+15', desc: 'دولة مشاركة' },
    { title: '+15', desc: 'بحث مقدم' },
    { title: '+25', desc: 'مؤتمر منظم' },
  ];

  useEffect(() => {
    const fetchConferences = async () => {
      try {
        const response = await fetch("/api/conferences?limit=4");
        const payload = await response.json();
        setUpcoming(payload?.data?.items ?? []);
      } catch {
        setUpcoming([]);
      }
    };
    fetchConferences();
  }, []);

  const cards = [
    { title: 'المؤتمرات الدولية الأول للدراسات الإنسانية', date: 'نوفمبر 2025', location: 'القاهرة', speakers: '+250 باحث' },
    { title: 'المؤتمرات الدولية الأول للدراسات الإنسانية', date: 'نوفمبر 2025', location: 'القاهرة', speakers: '+250 باحث' },
    { title: 'المؤتمرات الدولية الأول للدراسات الإنسانية', date: 'نوفمبر 2025', location: 'القاهرة', speakers: '+250 باحث' },
  ];

  const benefits = [
    { title: 'التواصل الأكاديمي', detail: 'فرصة التواصل مع باحثين وأكاديميين من مختلف أنحاء العالم' },
    { title: 'نشر الأبحاث', detail: 'نشر الأبحاث في منصات علمية محكّمة ومرموقة' },
    { title: 'شهادات معتمدة', detail: 'الحصول على شهادات مشاركة معتمدة دولياً' },
    { title: 'تبادل الخبرات', detail: 'الاستفادة من خبرات وتبادل الخبرات بين المشاركين' },
  ];

  return (
    <section className={styles.conferencesSection}>
      <div className={styles.conferencesIntro}>
        <h1>المؤتمرات</h1>
        <p>مؤتمرات علمية دولية رفيعة تجمع نخبة الباحثين لتعزيز المعرفة، ومناقشة أحدث التطورات، ودعم الابتكار العلمي عالميًا.</p>
      </div>

      <div className={styles.conferenceStatsGrid}>
        {stats.map((s, i) => (
          <div key={i} className={styles.conferenceStatCard}>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>

      <h2 className={styles.upcomingTitle}>المؤتمرات القادمة</h2>
      <div className={styles.upcomingConferencesGrid}>
        {upcoming.map((item, idx) => (
          <article key={item.id ?? idx} className={styles.conferenceCard}>
            <div className={styles.conferenceImage} style={{ backgroundImage: `url(${item.image || "/images/conference-1.jpg"})` }} />
            <div className={styles.conferenceInfo}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <div className={styles.conferenceMeta}>
                <span>{item.date}</span>
                <span>{item.location}</span>
                <span>{item.attendees}</span>
              </div>
              <div className={styles.conferenceActions}>
                <button className={styles.btnSecondary}>المزيد من التفاصيل</button>
                <button className={styles.btnPrimary}>سجل الآن</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className={styles.conferenceSummaryGrid}>
        {cards.map((card, i) => (
          <div key={i} className={styles.conferenceSummaryCard}>
            <p className={styles.summaryTitle}>{card.title}</p>
            <div className={styles.summaryMeta}>{card.date} · {card.location} · {card.speakers}</div>
          </div>
        ))}
      </div>

      <div className={styles.benefitsSection}>
        <h2>فوائد المشاركة في مؤتمراتنا</h2>
        <div className={styles.benefitsGrid}>
          {benefits.map((b, i) => (
            <div key={i} className={styles.benefitCard}>
              <h3>{b.title}</h3>
              <p>{b.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
