"use client";

import { useEffect } from 'react';
import styles from '../page.module.css';
import Image from 'next/image';
import { logMagazineTraffic } from '@/lib/traffic-logger';

interface MagazineBannerProps {
  title: string;
  magazineId?: number;
  coverImage?: string;
  description?: string;
}

export default function MagazineBanner({
  title,
  magazineId,
  coverImage = "/images/new-scientist.jpg",
  description,
}: MagazineBannerProps) {
  useEffect(() => {
    // Log view when component mounts
    if (magazineId) {
      logMagazineTraffic(magazineId, 'view');
    }
  }, [magazineId]);

  return (
        <div className={styles.magazineBanner}>
            <div className={styles.magazineCover}>
                <Image
                    src={coverImage}
                    width={300}
                    height={400}
                    alt={title}
                />
                </div>
            <div className={styles.magazinetitle}>
                <h1>{title}</h1>
                <h3>
                  {description ??
                    "لوريم إيبسوم هو ببساطة نص شكلي (بمعنى أن الغاية هي الشكل وليس المحتوى) ويُستخدم في صناعات الطباعة والتنضيد. كان لوريم إيبسوم هو النص الوهمي القياسي منذ القرن الخامس عشر، عندما أخذت مطبعة غير معروفة مجموعة من الأحرف وخلطتها لتكوين كتاب عينة. لقد نجت ليس فقط خمسة قرون، بل أيضًا قفزة إلى التنضيد الإلكتروني، وظلت دون تغيير جوهري."}
                </h3>
            </div>
        </div>
    );
}