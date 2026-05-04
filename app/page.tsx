import styles from "./page.module.css";
import Hero from "./components/hero";
import Reasons from "./components/reasons";
import OurExperties from "./components/our-experties";
import PublishAResearch from "./components/publish-a-research";
import FAQ from "./components/faq";
import Blog from "./components/blog";

function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Hero />
        <Reasons />
        <OurExperties />
        <PublishAResearch />
        <Blog />
        <FAQ />
      </main>
    </div>
  );
}
export default Home;
