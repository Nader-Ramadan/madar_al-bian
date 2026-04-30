"use client";
import styles from '../page.module.css';
import { useEffect, useState } from "react";

export default function AdvisoryCommittee() {
  const [committeeMembers, setCommitteeMembers] = useState<Array<{
    id: number;
    name: string;
    title: string;
    bio: string;
    image: string;
  }>>([]);

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

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch("/api/advisory-members?limit=8");
        const payload = await response.json();
        setCommitteeMembers(payload?.data?.items ?? []);
      } catch {
        setCommitteeMembers([]);
      }
    };
    fetchMembers();
  }, []);

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
              <div className={styles.memberBadge}>{member.name}</div>
              <div className={styles.memberInfo}>
                <p className={styles.memberTitle}>{member.title}</p>
                <p className={styles.memberSpecialty}>{member.bio}</p>
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
