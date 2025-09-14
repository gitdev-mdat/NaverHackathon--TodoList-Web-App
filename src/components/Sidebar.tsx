import { NavLink } from "react-router-dom";
import { LayoutDashboard, ListTodo, Calendar } from "lucide-react";
import styles from "../styles/Sidebar.module.css";

type MenuItem = {
  to: string;
  label: string;
  Icon: React.ComponentType<any>;
};

const MENU: MenuItem[] = [
  { to: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { to: "tasks", label: "Task List", Icon: ListTodo },
  { to: "calendar", label: "Calendar", Icon: Calendar },
];

export default function Sidebar() {
  return (
    <aside className={styles.sidebar} aria-label="Main navigation">
      <div className={styles.brand}>
        <h1 className={styles.logo}>TodoNaver</h1>
      </div>

      <nav className={styles.nav}>
        {MENU.map((m) => (
          <NavLink
            key={m.to}
            to={`/todo/${m.to}`}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ""}`
            }
          >
            <m.Icon size={18} />
            <span className={styles.label}>{m.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <small>v1.0 • Student</small>
      </div>
    </aside>
  );
}
