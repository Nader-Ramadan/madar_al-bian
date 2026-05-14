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
    const rows = await prisma.blogPost.findMany({
      orderBy: { id: "desc" },
      take: 6,
    });
    // #region agent log
    fetch('http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'51cdae'},body:JSON.stringify({sessionId:'51cdae',runId:'site-debug',hypothesisId:'H1',location:'app/components/blog.tsx:getBlogPosts',message:'blog_fetch_ok',data:{rowCount:rows.length},timestamp:0})}).catch(()=>{});
    // #endregion
    return rows;
  } catch (err) {
    // #region agent log
    fetch('http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'51cdae'},body:JSON.stringify({sessionId:'51cdae',runId:'site-debug',hypothesisId:'H1',location:'app/components/blog.tsx:getBlogPosts',message:'blog_fetch_failed',data:{name:err instanceof Error ? err.name : 'unknown'},timestamp:0})}).catch(()=>{});
    // #endregion
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
        {blogPosts.map((post, idx) => {
          const imgSrc = post.image || "/images/The-Business-Magazine-Cover-Design.jpg";
          const imgRemote =
            imgSrc.startsWith("http://") ||
            imgSrc.startsWith("https://") ||
            imgSrc.startsWith("/uploads/");
          return (
          <article key={post.id ?? idx} className={styles.blogCard}>
                <div className={styles.blogImageWrapper}>
                    <Image
                        src={imgSrc}
                        alt={post.title}
                        width={400}
                        height={250}
                        className={styles.blogImage}
                        unoptimized={imgRemote}
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
          );
        })}
      </div>
    </section>
  );
}
