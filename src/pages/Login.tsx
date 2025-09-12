import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "../styles/Login.module.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Nếu đã login rồi thì redirect luôn
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      navigate("/todo");
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem("users") || "[]");

    const foundUser = users.find(
      (u: { username: string; password: string }) =>
        u.username === username && u.password === password
    );

    if (foundUser) {
      localStorage.setItem("currentUser", JSON.stringify(foundUser));
      navigate("/todo");
    } else {
      alert("Sai username hoặc password!");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Đăng nhập</h1>
        <form className={styles.form} onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
          <button type="submit" className={styles.button}>
            Đăng nhập
          </button>
        </form>
        <p className={styles.registerText}>
          Chưa có tài khoản?{" "}
          <Link to="/register" className={styles.link}>
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
