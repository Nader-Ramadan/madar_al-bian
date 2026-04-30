import type { Metadata } from "next";
import styles from "../page.module.css";
import Blog from "../components/blog";

export const metadata: Metadata = {
  title: "Blog",
};

export default function BlogPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Blog />
      </main>
    </div>
  );
}
