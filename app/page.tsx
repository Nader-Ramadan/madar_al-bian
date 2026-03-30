import styles from "./page.module.css";
import Hero from "./components/hero";
import NavBar from "./components/nav-bar";
import Reasons from "./components/reasons";
import OurExperties from "./components/our-experties";
import PublishAResearch from "./components/publish-a-research";
import FAQ from "./components/faq";
import Blog from "./components/blog";
import Footer from "./components/footer";

function Home() {
  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        <Hero />
        <Reasons />
        <OurExperties />
        <PublishAResearch />
        <Blog />
        <FAQ />
        <Footer />
      </main>
    </div>
  );
}
export default Home;