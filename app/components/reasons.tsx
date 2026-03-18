import styles from "./reasons.module.css";

const reasons = [
  {
    title: "مجلات علمية محكمة",
    description:
      "نقدم مجموعة متنوعة من المجلات العلمية المحكمة في مختلف التخصصات",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H18" />
        <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H18" />
        <path d="M4 11.5h16" />
        <path d="M10 2v20" />
      </svg>
    ),
  },
  {
    title: "لجنة استشارية متميزة",
    description:
      "فريق من الخبراء والأكاديميين المتخصصين لضمان جودة النشر",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "مؤتمرات دولية",
    description: "تنظيم مؤتمرات علمية دولية لتبادل المعرفة والخبرات",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4" />
        <path d="M2 12h4" />
        <path d="M12 2v4" />
        <path d="M12 18v4" />
        <circle cx="12" cy="12" r="6" />
      </svg>
    ),
  },
  {
    title: "نشر سريع وموثوق",
    description: "عملية نشر احترافية وسريعة للأبحاث والدراسات العلمية",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12h16" />
        <path d="M4 6h10" />
        <path d="M4 18h16" />
        <path d="M14 6l7 6-7 6" />
      </svg>
    ),
  },
];

export default function Reasons() {
  return (
    <section className={styles.reasons}>
      <h2 className={styles.title}>لماذا تختار مؤسسة مدار البيان؟</h2>
      <div className={styles.grid}>
        {reasons.map((reason) => (
          <article key={reason.title} className={styles.card}>
            <div className={styles.icon} aria-hidden="true">
              {reason.icon}
            </div>
            <h3 className={styles.cardTitle}>{reason.title}</h3>
            <p className={styles.cardText}>{reason.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
