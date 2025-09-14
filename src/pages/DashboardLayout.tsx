import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import styles from "../styles/DashboardLayout.module.css";

export default function DashboardLayout() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
