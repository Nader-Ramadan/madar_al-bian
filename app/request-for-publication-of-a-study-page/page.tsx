import styles from "../page.module.css";
import NavBar from "../components/nav-bar";
import RequestForPublication from "../components/request-for-publication";
import Footer from "../components/footer";

export default function RequestForPublicationPage() {
  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        <RequestForPublication />
        <Footer />
      </main>
    </div>
  );
}