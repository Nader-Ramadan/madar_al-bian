import styles from "../page.module.css";
import NavBar from "../components/nav-bar";
import AboutUs from "../components/about-us";
import Footer from "../components/footer";

export default function AboutUsPage() {
  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        <AboutUs />
      </main>
      <Footer />
    </div>
  );
}
