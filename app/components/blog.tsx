import Image from 'next/image';
import Link from 'next/link';
import styles from '../page.module.css';
import { prisma } from "@/lib/prisma";

type BlogPost = {
  id: number;
  title: string;
  summary: string;
  date: string;
  author: string;
  image?: string | null;
};

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    return await prisma.blogPost.findMany({
      orderBy: { id: "desc" },
      take: 6,
    });
  } catch {
    return [];
  }
}

export default async function Blog() {
  const blogPosts = await getBlogPosts();
  return (
    <section className={styles.blogSection}>
      <h2 className={styles.blogTitle}>المدونة</h2>
      <p className={styles.blogSubtitle}>مقالات ونصائح قيمة للباحثين والأكاديميين في مجال النشر العلمي والبحث الأكاديمي</p>
      <div className={styles.blogGrid}>
        {blogPosts.map((post, idx) => (
          <article key={post.id ?? idx} className={styles.blogCard}>
                <div className={styles.blogImageWrapper}>
                    <Image
                        src={post.image || "/images/The-Business-Magazine-Cover-Design.jpg"}
                        alt={post.title}
                        width={400}
                        height={250}
                        className={styles.blogImage}
                    />
            </div>
            <div className={styles.blogCardBody}>
              <h3>{post.title}</h3>
              <p>{post.summary}</p>
              <div className={styles.blogMeta}>
                <span>{post.author}</span>
                <span>{post.date}</span>
              </div>
              <Link href='/blog' className={styles.blogReadMore}>اقرأ المزيد</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
