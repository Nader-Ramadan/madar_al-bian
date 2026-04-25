import styles from "../../page.module.css";
import NavBar from "../../components/nav-bar";
import Footer from "../../components/footer";
import Magazinebanner from "../../components/magazine-banner";
import MagazineContent from "../../components/magazine-content";
import MagazineVersions from "../../components/magazines-versions";

function magazinePage() {
  return (
    <div className={styles.page}>
      <NavBar />
        <Magazinebanner />
        <MagazineContent />
        <MagazineVersions />
        <Footer />
    </div>
  );
}
export default magazinePage;