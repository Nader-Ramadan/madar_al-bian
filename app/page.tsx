import styles from "./page.module.css";
import Hero from "./components/hero";
import Reasons from "./components/reasons";
import OurExperties from "./components/our-experties";
import PublishAResearch from "./components/publish-a-research";
import FAQ from "./components/faq";
import Blog from "./components/blog";

function Home() {
  // #region agent log
  fetch('http://127.0.0.1:7406/ingest/1076ec58-3026-4361-bd36-5095553884e3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'51cdae'},body:JSON.stringify({sessionId:'51cdae',runId:'pre-fix',location:'app/page.tsx:Home',message:'home_page_render',data:{},timestamp:Date.now(),hypothesisId:'H12'})}).catch(()=>{});
  // #endregion
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