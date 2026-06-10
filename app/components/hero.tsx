"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";

function Hero() {
  return (
    <Link href="/about-us" className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.heroMedia} aria-hidden>
        <Image
          src="/images/IMG-20260604-WA0009.jpg"
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 100vw"
          className={styles.heroBgImage}
        />
      </div>
      <h1 id="hero-heading" className={styles.visuallyHidden}>
        مؤسسة مدار البيان للنشر العلمي
      </h1>
    </Link>
  );
}

export default Hero;
