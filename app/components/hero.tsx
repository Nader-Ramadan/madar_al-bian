"use client";

import styles from '../page.module.css';
import Image from 'next/image';

function hero() {
    return (
        <section className={styles.hero}>
            <div className={styles.emblem}>
                <div className={styles.emblemCircle}>
                    <Image 
                        src="/images/logo/vertical-logo/svg-vertical-main-logo-transparent.svg" 
                        alt="Logo"
                        width={100}
                        height={100}
                        className={styles.emblemLogo}
                    />
                </div>
                <a href="../about-us-page/"><button className={styles.button}>من  نحن</button></a>
            </div>

            <div className={styles.content}>
                <h1 className={styles.title}>مؤسسة مدار البيان للنشر العلمي</h1>
                <p className={styles.subtitle}>
                    مرحباً بكم في مؤسسة مدار البيان للنشر العلمي حيث نرتقي بالبحث العلمي إلى آفاق جديدة من التميز والابتكار
                </p>
            </div>

            <div className={styles.dots}>
                <div className={`${styles.dot} ${styles.active}`}></div>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
            </div>
        </section>
    );
}
export default hero;