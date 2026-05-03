"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";

function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <Image
        src="/images/banner.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className={styles.heroBgImage}
        aria-hidden
      />
      <h1 id="hero-heading" className={styles.visuallyHidden}>
        مؤسسة مدار البيان للنشر العلمي
      </h1>
      <div className={styles.heroInner}>
        <Link href="/about-us" className={styles.button}>
          من نحن
        </Link>
      </div>
    </section>
  );
}

export default Hero;
