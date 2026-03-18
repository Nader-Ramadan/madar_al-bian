import Image from "next/image";
import styles from "./page.module.css";
import Hero from "./components/hero";
import NavBar from "./components/nav-bar";
import Reasons from "./components/reasons";

function Home() {
  return (
    <div className={styles.page}>
      <NavBar />
      <main className={styles.main}>
        <Hero />
        <Reasons />
      </main>
    </div>
  );
}
export default Home;