import { LayoutDashboard, ListTodo, Calendar } from "lucide-react";
import styles from "../styles/Sidebar.module.css";

type Menu = "dashboard" | "tasks" | "calendar";

interface SidebarProps {
  onSelect: (menu: Menu) => void;
  active: Menu;
}

// Config menu items
const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tasks", label: "Task List", icon: ListTodo },
  { id: "calendar", label: "Calendar", icon: Calendar },
] as const;

export default function Sidebar({ onSelect, active }: SidebarProps) {
  return (
    <div className={styles.sidebar}>
      <h1 className={styles.logo}>TodoNaver</h1>
      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id as Menu)}
            className={`${styles.navItem} ${
              active === item.id ? styles.active : ""
            }`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
