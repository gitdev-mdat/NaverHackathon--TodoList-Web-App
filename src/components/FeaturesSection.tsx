import styles from "../styles/Home.module.css";
import {
  Edit3,
  CheckCircle,
  Calendar,
  BarChart2,
  Clock,
  Cpu,
} from "lucide-react";

const FEATURES = [
  {
    title: "Create / Edit / Delete",
    desc: "Manage tasks with title, description, priority, start (datetime or all-day) and optional end. Easy edit & delete.",
    Icon: Edit3,
    color: "#0ea5e9",
  },
  {
    title: "Complete tasks",
    desc: "Toggle completed. Completed tasks are hidden when filtered out.",
    Icon: CheckCircle,
    color: "#10b981",
  },
  {
    title: "Calendar view",
    desc: "Month grid with dots for days that have tasks. Click a day to view or edit that day's tasks.",
    Icon: Calendar,
    color: "#6366f1",
  },
  {
    title: "Dashboard & Heatmap",
    desc: "Overview stats (completed, pending, perfect days) and an activity heatmap for quick insights.",
    Icon: BarChart2,
    color: "#f59e0b",
  },
  {
    title: "Recent activity",
    desc: "Timeline of task creation and completion events to help you track progress.",
    Icon: Clock,
    color: "#ef4444",
  },
  {
    title: "AI Assistant (NL → Task)",
    desc: "Paste your Gemini API key (session only), parse natural-language instructions, preview results and create tasks.",
    Icon: Cpu,
    color: "#7c3aed",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className={styles.featuresSection}
      aria-labelledby="features-title"
    >
      <div className={styles.featuresInner}>
        <h2 id="features-title" className={styles.featuresTitle}>
          Key features
        </h2>
        <p className={styles.featuresSubtitle}>
          The core features that make it easier to manage tasks clearly and
          efficiently.
        </p>

        <div className={styles.featuresGrid} role="list">
          {FEATURES.map((f) => {
            const Icon = f.Icon;
            return (
              <article
                key={f.title}
                className={styles.featureCard}
                role="listitem"
                tabIndex={0}
              >
                <div
                  className={styles.featureIcon}
                  aria-hidden="true"
                  style={{
                    background: `linear-gradient(180deg, ${f.color}22, ${f.color}08)`,
                    borderColor: `${f.color}20`,
                  }}
                >
                  <Icon size={28} style={{ color: f.color }} />
                </div>

                <div className={styles.featureBody}>
                  <h3 className={styles.featureTitle}>{f.title}</h3>
                  <p className={styles.featureDesc}>{f.desc}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
