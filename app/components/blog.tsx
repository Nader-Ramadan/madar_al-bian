import Image from 'next/image';
import Link from 'next/link';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';
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
  // Hostinger builds may not reach MySQL; a hung query exceeds Next's 60s prerender limit.
  // Posts are filled in at runtime via the pages' `revalidate`.
  if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) return [];
  const started = Date.now();
  try {
    const rows = await prisma.blogPost.findMany({
      orderBy: { id: "desc" },
      take: 6,
    });
    // #region agent log
    console.log(`[debug-blog] query ok ${JSON.stringify({ hypothesisId: "H1", elapsedMs: Date.now() - started, phase: process.env.NEXT_PHASE ?? null })}`);
    fetch("http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "34450b" },
      body: JSON.stringify({
        sessionId: "34450b",
        runId: "pre-fix",
        hypothesisId: "D",
        location: "app/components/blog.tsx:getBlogPosts",
        message: "blog prerender query ok",
        data: { elapsedMs: Date.now() - started, count: rows.length },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    return rows;
  } catch (err) {
    // #region agent log
    console.log(`[debug-blog] query failed ${JSON.stringify({ hypothesisId: "H1", elapsedMs: Date.now() - started, phase: process.env.NEXT_PHASE ?? null, error: err instanceof Error ? err.message.slice(0, 160) : String(err).slice(0, 160) })}`);
    fetch("http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "34450b" },
      body: JSON.stringify({
        sessionId: "34450b",
        runId: "pre-fix",
        hypothesisId: "D",
        location: "app/components/blog.tsx:getBlogPosts",
        message: "blog prerender query failed",
        data: {
          elapsedMs: Date.now() - started,
          errorName: err instanceof Error ? err.name : "unknown",
          errorMessage: err instanceof Error ? err.message.slice(0, 180) : String(err).slice(0, 180),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
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
                        fill
                        className={styles.blogImage}
                        sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 280px"
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
