import Image from 'next/image';
import styles from '../page.module.css';

const REASON_ICONS = [
  { src: '/Icons/features-icon.svg', alt: 'مجلات علمية محكمة' },
  { src: '/Icons/1000001546.svg', alt: 'لجنة استشارية' },
  { src: '/Icons/1000001547.svg', alt: 'مؤتمرات دولية' },
  { src: '/Icons/1000001548.svg', alt: 'نشر سريع وموثوق' },
] as const;

const reasons = [
  {
    title: 'مجلات علمية محكمة',
    description:
      'نقدم مجموعة متنوعة من المجلات العلمية المحكمة المفهرسة في مختلف التخصصات',
    iconIndex: 0,
  },
  {
    title: 'لجنة استشارية متميزة',
    description:
      'فريق من الخبراء والأكاديميين المتخصصين لضمان جودة النشر',
    iconIndex: 1,
  },
  {
    title: 'مؤتمرات دولية',
    description: 'تنظيم مؤتمرات علمية دولية لتبادل المعرفة والخبرات',
    iconIndex: 2,
  },
  {
    title: 'نشر سريع وموثوق',
    description: 'عملية نشر احترافية وسريعة للأبحاث والدراسات العلمية',
    iconIndex: 3,
  },
];

export default function Reasons() {
  return (
    <section className={styles.reasons}>
      <h2 className={styles.reasonsTitle}>لماذا تختار مؤسسة مدار البيان؟</h2>
      <div className={styles.reasonsGrid}>
        {reasons.map((reason) => {
          const icon = REASON_ICONS[reason.iconIndex];
          return (
            <article key={reason.title} className={styles.reasonsCard}>
              <div className={styles.reasonsIcon} aria-hidden="true">
                <Image
                  src={icon.src}
                  alt=""
                  width={80}
                  height={80}
                  className={styles.reasonsIconImg}
                  sizes="(max-width: 480px) 64px, 80px"
                />
              </div>
              <h3 className={styles.reasonsCardTitle}>{reason.title}</h3>
              <p className={styles.reasonsCardText}>{reason.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
