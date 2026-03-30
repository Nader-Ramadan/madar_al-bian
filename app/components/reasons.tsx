import Image from 'next/image';
import styles from '../page.module.css';

const reasons = [
  {
    title: "مجلات علمية محكمة",
    description:
      "نقدم مجموعة متنوعة من المجلات العلمية المحكمة المفهرسة في مختلف التخصصات",
    icon: (
      <Image
        src="/Icons/features-icon.svg"
        alt="لجنة استشارية"
        width={80}
        height={80}
      />
    ),
  },
  {
    title: "لجنة استشارية متميزة",
    description:
      "فريق من الخبراء والأكاديميين المتخصصين لضمان جودة النشر",
    icon: (
      <Image
        src="/Icons/1000001546.svg"
        alt="لجنة استشارية"
        width={80}
        height={80}
      />
    ),
  },
  {
    title: "مؤتمرات دولية",
    description: "تنظيم مؤتمرات علمية دولية لتبادل المعرفة والخبرات",
    icon: (
      <Image
        src="/Icons/1000001547.svg"
        alt="لجنة استشارية"
        width={80}
        height={80}
      />
    ),
  },
  {
    title: "نشر سريع وموثوق",
    description: "عملية نشر احترافية وسريعة للأبحاث والدراسات العلمية",
    icon: (
      <Image
        src="/Icons/1000001548.svg"
        alt="لجنة استشارية"
        width={80}
        height={80}
      />
    ),
  },
];

export default function Reasons() {
  return (
    <section className={styles.reasons}>
      <h2 className={styles.reasonsTitle}>لماذا تختار مؤسسة مدار البيان؟</h2>
      <div className={styles.reasonsGrid}>
        {reasons.map((reason) => (
          <article key={reason.title} className={styles.reasonsCard}>
            <div aria-hidden="true">
              {reason.icon}
            </div>
            <h3 className={styles.reasonsCardTitle}>{reason.title}</h3>
            <p className={styles.reasonsCardText}>{reason.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
