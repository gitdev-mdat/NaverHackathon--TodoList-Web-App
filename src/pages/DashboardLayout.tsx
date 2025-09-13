import Sidebar from "../components/Sidebar";
import { useState } from "react";
import styles from "../styles/DashboardLayout.module.css";

type Menu = "dashboard" | "tasks" | "calendar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [active, setActive] = useState<Menu>("tasks");

  return (
    <div className={styles.layout}>
      <Sidebar active={active} onSelect={setActive} />
      <div className={styles.main}>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
