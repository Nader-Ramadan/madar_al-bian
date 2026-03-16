import Image from "next/image";
import styles from "./page.module.css";
import Hero from "./components/hero";
import NavBar from "./components/nav-bar";

function Home() {
  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
      <Hero/>
        
      </main>
    </div>
  );
}
export default Home;