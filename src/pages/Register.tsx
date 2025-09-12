import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "../styles/Login.module.css"; // reuse login css

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem("users") || "[]");

    const exists = users.find(
      (u: { username: string }) => u.username === username
    );

    if (exists) {
      alert("Username đã tồn tại!");
      return;
    }

    const newUser = { username, password };
    localStorage.setItem("users", JSON.stringify([...users, newUser]));
    alert("Đăng ký thành công! Giờ bạn có thể đăng nhập.");
    navigate("/login");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Đăng ký</h1>
        <form className={styles.form} onSubmit={handleRegister}>
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
            Đăng ký
          </button>
        </form>
        <p className={styles.registerText}>
          Đã có tài khoản?{" "}
          <Link to="/login" className={styles.link}>
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
