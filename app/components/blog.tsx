import Image from 'next/image';
import Link from 'next/link';
import styles from '../page.module.css';

const blogPosts = [
  {
    title: 'نصائح بحثية',
    summary: 'كيف تكتب ملخصاً فعّالاً لبحثك العلمي',
    date: '5 مارس 2026',
    author: 'سارة أحمد',
  },
  {
    title: 'نصائح بحثية',
    summary: 'كيف تكتب ملخصاً فعّالاً لبحثك العلمي',
    date: '5 مارس 2026',
    author: 'سارة أحمد',
  },
  {
    title: 'نصائح بحثية',
    summary: 'كيف تكتب ملخصاً فعّالاً لبحثك العلمي',
    date: '5 مارس 2026',
    author: 'سارة أحمد',
  },
  {
    title: 'نصائح بحثية',
    summary: 'كيف تكتب ملخصاً فعّالاً لبحثك العلمي',
    date: '5 مارس 2026',
    author: 'سارة أحمد',
  },
];

export default function Blog() {
  return (
    <section className={styles.blogSection}>
      <h2 className={styles.blogTitle}>المدونة</h2>
      <p className={styles.blogSubtitle}>مقالات ونصائح قيمة للباحثين والأكاديميين في مجال النشر العلمي والبحث الأكاديمي</p>
      <div className={styles.blogGrid}>
        {blogPosts.map((post, idx) => (
          <article key={idx} className={styles.blogCard}>
                <div className={styles.blogImageWrapper}>
                    <Image
                        src="/images/The-Business-Magazine-Cover-Design.jpg"
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
