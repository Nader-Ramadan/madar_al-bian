import styles from '../page.module.css';

export default function AdvisoryCommittee() {
  const committeeMember = {
    name: 'د. أحمد سميث',
    title: 'استاذ دكتور في القانون الدولي والقانون العام',
    specialty: 'الراء والدراسات',
    image: '/images/committee-member.jpg',
  };

  const committeeMembers = Array(8).fill(committeeMember);

  const criteria = [
    {
      title: 'الخبرة البحثية',
      description: 'تمتلك خبرة واسعة ومعمقة في إجراء الأبحاث والدراسات العلمية المتقدمة عبر مختلف المجالات والتخصصات.',
    },
    {
      title: 'المؤهلات العلمية',
      description: 'حصول على درجات الدكتوراه والتخصص في مجالات أكاديمية وسياقة في مجالات الاختصاص',
    },
    {
      title: 'التحكيم العلمي',
      description: 'خبرة واسعة في تحكيم الأبحاث العلمية والدراسات والمشاريع البحثية',
    },
    {
      title: 'السمعة الأكاديمية',
      description: 'معروفون وذو سمعة مرموقة ويحظون بالاعتراف من قبل المجتمع الأكاديمي والعلمي الدولي والمؤسسات العلمية المرموقة الأخرى.',
    },
  ];

  return (
    <section className={styles.advisoryCommitteeSection}>
      {/* Header and Stats */}
      <div className={styles.advisoryCommitteeHeader}>
        <h1 className={styles.advisoryCommitteeTitle}>اللجنة الاستشارية</h1>
        <p className={styles.advisoryCommitteeSubtitle}>
          فريق من الخبراء والأكاديميين المتخصصين في مختلف التخصصات العلمية، يعملون على ضمان جودة وتميز الأبحاث المنشورة
        </p>

        
      </div>

      {/* Committee Members Grid */}
      <div className={styles.committeeMembersWrapper}>
        <div className={styles.committeeMembersGrid}>
          {committeeMembers.map((member, index) => (
            <div key={index} className={styles.committeeMemberCard}>
              <div className={styles.memberImagePlaceholder}>
                <div className={styles.memberImageBackground} />
              </div>
              <div className={styles.memberBadge}>د. أحمد سميث</div>
              <div className={styles.memberInfo}>
                <p className={styles.memberTitle}>استاذ دكتور في القانون الدولي والقانون الدولي</p>
                <p className={styles.memberSpecialty}>الراء والدراسات</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selection Criteria Section */}
      <div className={styles.selectionCriteriaSection}>
        <h2>معايير اختيار أعضاء اللجنة الاستشارية</h2>
        <div className={styles.selectionCriteriaGrid}>
          {criteria.map((item, index) => (
            <div key={index} className={styles.criteriaCard}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
