import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, ListTodo, Calendar, Cpu } from "lucide-react";
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
  { to: "ai", label: "AI Assistant", Icon: Cpu },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("currentUser");
      if (raw) {
        const u = JSON.parse(raw);
        setUsername(u?.username ?? null);
      } else {
        setUsername(null);
      }
    } catch {
      setUsername(null);
    }
  }, []);

  const handleLogout = () => {
    // optional confirmation:
    if (!confirm("Sign out?")) return;

    try {
      localStorage.removeItem("currentUser");

      try {
        sessionStorage.removeItem("GEMINI_API_KEY_SESSION");
      } catch {}
      if (username) {
        try {
          sessionStorage.removeItem(`login_attempts_${username}`);
          sessionStorage.removeItem(`login_lock_${username}`);
        } catch {}
      }
    } catch (err) {
      console.error("logout cleanup failed", err);
    }
    navigate("/login", { replace: true });
  };

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
        {username ? (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 13, color: "#0b2f3c", fontWeight: 700 }}>
              {username}
            </div>
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <button
                onClick={handleLogout}
                className={styles.ghostBtn}
                style={{ padding: "6px 8px", fontSize: 13 }}
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <small>v1.0 • thiminhdat</small>
        )}
      </div>
    </aside>
  );
}
