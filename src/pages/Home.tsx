import styles from "../styles/Home.module.css";
import heroImage from "../assets/heroImage2.jpg";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className={styles.page} id="trang-chu">
      <header className={styles.header}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>TodoNaver</div>
          <nav aria-label="Điều hướng chính">
            <ul className={styles.navMenu}>
              <li>
                <a href="#trang-chu">Trang chủ</a>
              </li>
              <li>
                <a href="#tinh-nang">Tính năng</a>
              </li>
              <li>
                <a href="#giai-phap">Giải pháp</a>
              </li>
              <li>
                <a href="#lien-he">Liên hệ</a>
              </li>
            </ul>
          </nav>
          <a
            href="#dang-nhap"
            className={styles.ctaButton}
            onClick={() => navigate("/login")}
          >
            Đăng nhập
          </a>
        </div>
      </header>

      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              🚀 Trình quản lý công việc thông minh
            </div>
            <h1 id="hero-title" className={styles.heroTitle}>
              Quản lý dễ dàng
              <br />
              <span className={styles.heroTitleAccent}>
                Danh sách việc cần làm
              </span>
            </h1>
            <p className={styles.heroSubtitle}>
              Nền tảng TodoList hiện đại giúp bạn sắp xếp công việc, theo dõi
              tiến độ và hoàn thành mục tiêu mỗi ngày một cách hiệu quả.
            </p>
            <div className={styles.heroButtons}>
              <button className={styles.btnPrimary}>Khám phá ngay</button>
              <button className={styles.btnSecondary}>Xem demo</button>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>1K+</span>
                <span className={styles.statLabel}>Người dùng</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>5K+</span>
                <span className={styles.statLabel}>Nhiệm vụ</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>98%</span>
                <span className={styles.statLabel}>Hoàn thành</span>
              </div>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.visualContainer}>
              <img
                src={heroImage}
                className={styles.heroImage}
                alt="Hình minh họa Todo App"
                style={{ width: "100%", height: "450px", objectFit: "cover" }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
