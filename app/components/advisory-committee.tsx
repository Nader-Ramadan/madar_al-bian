"use client";

import Image from "next/image";
import styles from "../page.module.css";
import { useEffect, useState } from "react";

const ADVISOR_PHOTO_FALLBACK = "/images/advisory-member-placeholder.svg";

function advisorPhotoSrc(image: string | null | undefined) {
  const trimmed = image?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : ADVISOR_PHOTO_FALLBACK;
}

function needsUnoptimizedPhoto(src: string) {
  return (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("/uploads/")
  );
}

type CommitteeMember = {
  id: number;
  name: string;
  title: string;
  bio?: string | null;
  image?: string | null;
};

export default function AdvisoryCommittee() {
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMember[]>([]);

  const criteria = [
    {
      title: "الخبرة البحثية",
      description:
        "تمتلك خبرة واسعة ومعمقة في إجراء الأبحاث والدراسات العلمية المتقدمة عبر مختلف المجالات والتخصصات.",
    },
    {
      title: "المؤهلات العلمية",
      description: "حصول على درجات الدكتوراه والتخصص في مجالات أكاديمية وسياقة في مجالات الاختصاص",
    },
    {
      title: "التحكيم العلمي",
      description: "خبرة واسعة في تحكيم الأبحاث العلمية والدراسات والمشاريع البحثية",
    },
    {
      title: "السمعة الأكاديمية",
      description:
        "معروفون وذو سمعة مرموقة ويحظون بالاعتراف من قبل المجتمع الأكاديمي والعلمي الدولي والمؤسسات العلمية المرموقة الأخرى.",
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
      <div className={styles.advisoryCommitteeHeader}>
        <h1 className={styles.advisoryCommitteeTitle}>اللجنة الاستشارية</h1>
        <p className={styles.advisoryCommitteeSubtitle}>
          فريق من الخبراء والأكاديميين المتخصصين في مختلف التخصصات العلمية، يعملون على ضمان جودة
          وتميز الأبحاث المنشورة
        </p>
      </div>

      <div className={styles.committeeMembersWrapper}>
        <div className={styles.committeeMembersGrid}>
          {committeeMembers.map((member) => {
            const photoSrc = advisorPhotoSrc(member.image);
            return (
              <div key={member.id} className={styles.committeeMemberCard}>
                <div className={styles.memberImagePlaceholder}>
                  <Image
                    src={photoSrc}
                    alt={member.name}
                    fill
                    className={styles.memberPhoto}
                    sizes="(max-width: 768px) 50vw, 250px"
                    unoptimized={needsUnoptimizedPhoto(photoSrc)}
                  />
                </div>
                <div className={styles.memberBadge}>{member.name}</div>
                <div className={styles.memberInfo}>
                  <p className={styles.memberTitle}>{member.title}</p>
                  {member.bio?.trim() ? (
                    <p className={styles.memberSpecialty}>{member.bio}</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
