import styles from "../page.module.css";
import NavBar from "../components/nav-bar";
import Blog from "../components/blog";
import Footer from "../components/footer";

export default function BlogPage() {
  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        <Blog />
      </main>
      <Footer />
    </div>
  );
}
