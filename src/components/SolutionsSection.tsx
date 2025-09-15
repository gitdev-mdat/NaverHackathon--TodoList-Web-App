import styles from "../styles/Home.module.css";
import { Globe, Server, ShieldCheck, Layers, Users, Zap } from "lucide-react";

const SOLUTIONS = [
  {
    title: "Frontend-first architecture",
    desc: "Fast prototyping and focused UX — all core logic runs client-side (localStorage) to satisfy frontend-only hackathon constraints.",
    Icon: Globe,
    color: "#0ea5e9",
  },
  {
    title: "Scalable integration ready",
    desc: "Designed to plug a backend later — thin client API layer so you can add auth, DB and server-side AI proxy without rework.",
    Icon: Server,
    color: "#7c3aed",
  },
  {
    title: "Privacy-first AI usage",
    desc: "Client-side demo for Gemini, but recommended pattern is server-side proxy to keep API keys secret and control usage.",
    Icon: ShieldCheck,
    color: "#10b981",
  },
  {
    title: "Composable UI components",
    desc: "Reusable hooks & components (useTasks, modals, calendar) speed up iteration and unit testing.",
    Icon: Layers,
    color: "#f59e0b",
  },
  {
    title: "Team-ready features",
    desc: "Clear task metadata (priority, all-day, end-date) and activity feed make handoff and collaboration easier.",
    Icon: Users,
    color: "#ef4444",
  },
  {
    title: "Quick automation",
    desc: "NL → Task scouting with Gemini lets users create tasks with natural language, reducing friction and input time.",
    Icon: Zap,
    color: "#6366f1",
  },
];

export default function SolutionsSection() {
  return (
    <section
      id="solutions"
      className={styles.solutionsSection}
      aria-labelledby="solutions-title"
    >
      <div className={styles.solutionsInner}>
        <div className={styles.solutionsLead}>
          <h2 id="solutions-title" className={styles.solutionsTitle}>
            Our solutions
          </h2>
          <p className={styles.solutionsSubtitle}>
            How TodoNaver solves common productivity problems — technical
            choices and benefits explained.
          </p>
          <div className={styles.solutionsCtas}>
            <a className={styles.primaryLink} href="#features">
              See features
            </a>
            <button
              className={styles.ghostBtn}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Try demo
            </button>
          </div>
        </div>

        <div className={styles.solutionsGrid}>
          {SOLUTIONS.map((s) => {
            const Icon = s.Icon;
            return (
              <article key={s.title} className={styles.solutionCard}>
                <div
                  className={styles.solutionIcon}
                  style={{
                    background: `${s.color}18`,
                    borderColor: `${s.color}26`,
                  }}
                  aria-hidden="true"
                >
                  <Icon size={24} style={{ color: s.color }} />
                </div>
                <div className={styles.solutionBody}>
                  <h3 className={styles.solutionTitle}>{s.title}</h3>
                  <p className={styles.solutionDesc}>{s.desc}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
