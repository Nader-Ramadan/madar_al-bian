import styles from "../page.module.css";


function navBar() {
    return (
        <nav className={styles["nav-bar"]}>
            <div>
                <a href="../page.tsx">
                    LOGO
                </a>
            </div>
            <ul className={styles["nav-links"]}>
                <a href=""><li>الرئيسية</li></a>
                <a href=""><li>كل المجلات</li></a>
                <a href=""><li>اللجنة الاستشارية</li></a>
                <a href=""><li>طلب نشر دراسة</li></a>
                <a href=""><li>المؤتمرات</li></a>
                <a href=""><li>المدونة</li></a>
                <a href=""><li>من نحن</li></a>
                <a href=""><li>اتصل بنا</li></a>
            </ul>
            <button>Button</button>
        </nav>
    );
}
export default navBar;