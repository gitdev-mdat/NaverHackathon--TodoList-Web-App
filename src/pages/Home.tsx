import styles from "../styles/Home.module.css";
import heroImage from "../assets/heroImage2.jpg";
import { useNavigate } from "react-router-dom";
import FeaturesSection from "../components/FeaturesSection";
import SolutionsSection from "../components/SolutionsSection";

export default function Home() {
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) {
      // fallback: scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className={styles.page} id="home">
      <header className={styles.header}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>TodoNaver</div>

          <nav
            className={styles.nav}
            aria-label="Main navigation"
            role="navigation"
          >
            <ul className={styles.navMenu}>
              <li>
                <a
                  href="#home"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo("home");
                  }}
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo("features");
                  }}
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#solutions"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo("solutions");
                  }}
                >
                  Solutions
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo("contact");
                  }}
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>

          <button
            className={styles.ctaButton}
            onClick={() => navigate("/login")}
            aria-label="Sign in"
          >
            Sign in
          </button>
        </div>
      </header>

      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge} aria-hidden>
              🚀 Smart task manager
            </div>

            <h1 id="hero-title" className={styles.heroTitle}>
              Manage with ease
              <br />
              <span className={styles.heroTitleAccent}>Your to-do list</span>
            </h1>

            <p className={styles.heroSubtitle}>
              A modern TodoList platform to organize your work, track progress,
              and achieve your goals day by day — efficiently.
            </p>

            <div className={styles.heroButtons}>
              <button
                className={styles.btnPrimary}
                onClick={() => scrollTo("features")}
                aria-label="Explore features"
              >
                Explore now
              </button>

              <button
                className={styles.btnSecondary}
                onClick={() => navigate("/demo")}
                aria-label="View demo"
              >
                View demo
              </button>
            </div>

            <div className={styles.heroStats} aria-hidden>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>1K+</span>
                <span className={styles.statLabel}>Users</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>5K+</span>
                <span className={styles.statLabel}>Tasks</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>98%</span>
                <span className={styles.statLabel}>Completed</span>
              </div>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.visualContainer}>
              <img
                src={heroImage}
                className={styles.heroImage}
                alt="Illustration of the TodoNaver app UI"
                style={{ width: "100%", height: "450px", objectFit: "cover" }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className={styles.waveSeparator} aria-hidden>
        <svg viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden>
          <path
            d="M0,30 C150,80 350,0 600,30 C850,60 1050,10 1200,30 L1200 60 L0 60 Z"
            fill="white"
          />
        </svg>
      </div>

      <div className={styles.featuresOverlap}>
        <FeaturesSection />
      </div>

      <SolutionsSection />

      <footer
        id="contact"
        style={{ padding: 36, textAlign: "center", color: "var(--muted)" }}
      >
        <div>Contact — thiminhdatdaknong@gmail.com</div>
      </footer>
    </div>
  );
}
