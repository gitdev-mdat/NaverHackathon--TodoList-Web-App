import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "../styles/Login.module.css";

/** SHA-256 helper */
async function sha256Hex(input: string) {
  const enc = new TextEncoder();
  const data = enc.encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(hash);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** simple lockout helpers  */
function getAttemptKey(username: string) {
  return `login_attempts_${username}`;
}
function getLockKey(username: string) {
  return `login_lock_${username}`;
}

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{
    type: "error" | "info";
    text: string;
  } | null>(null);
  const navigate = useNavigate();

  // redirect if already logged in
  useEffect(() => {
    try {
      const saved = localStorage.getItem("currentUser");
      if (saved) navigate("/todo");
    } catch {}
  }, [navigate]);

  const usernameTrimmed = useMemo(() => username.trim(), [username]);

  // check if locked for this username
  const isLocked = useMemo(() => {
    try {
      const lockRaw = sessionStorage.getItem(
        getLockKey(usernameTrimmed || "__global")
      );
      if (!lockRaw) return false;
      return Date.now() < Number(lockRaw);
    } catch {
      return false;
    }
  }, [usernameTrimmed]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!usernameTrimmed || !password) {
      setMsg({ type: "error", text: "Please enter username and password." });
      return;
    }

    if (isLocked) {
      setMsg({
        type: "error",
        text: "Too many failed attempts. Try again later.",
      });
      return;
    }

    setLoading(true);
    try {
      const raw = localStorage.getItem("users") || "[]";
      let users: any[] = [];
      try {
        users = JSON.parse(raw);
        if (!Array.isArray(users)) users = [];
      } catch {
        users = [];
      }

      let idx = users.findIndex((u) => u.username === usernameTrimmed);
      if (idx === -1) {
        idx = users.findIndex(
          (u) =>
            String(u.username ?? "").toLowerCase() ===
            usernameTrimmed.toLowerCase()
        );
      }

      if (idx === -1) {
        countFail(usernameTrimmed);
        setMsg({ type: "error", text: "Invalid username or password." });
        return;
      }

      const stored = users[idx];
      const inputHash = await sha256Hex(password);

      let matched = false;
      if (stored.passwordHash) {
        matched = inputHash === stored.passwordHash;
      } else if (stored.password) {
        // legacy plain-text password
        if (password === stored.password) {
          matched = true;
          // perform migration
          users[idx] = { ...stored, passwordHash: inputHash };
          delete users[idx].password;
          try {
            localStorage.setItem("users", JSON.stringify(users));
          } catch {}
        }
      }

      if (!matched) {
        countFail(usernameTrimmed);
        setMsg({ type: "error", text: "Invalid username or password." });
        return;
      }

      // success — set currentUser (don't store passwordHash)
      const safeUser = {
        username: stored.username,
        createdAt: stored.createdAt ?? new Date().toISOString(),
      };
      localStorage.setItem("currentUser", JSON.stringify(safeUser));

      // clear attempt counters (use trimmed)
      clearFail(usernameTrimmed);

      // clear sensitive inputs
      setPassword("");
      setMsg({ type: "info", text: "Signed in" });

      // navigate
      navigate("/todo");
    } catch (err) {
      console.error("login error", err);
      setMsg({ type: "error", text: "Login failed — check console." });
    } finally {
      setLoading(false);
    }
  }

  function countFail(u: string) {
    try {
      const key = getAttemptKey(u);
      const raw = sessionStorage.getItem(key);
      const n = raw ? Number(raw) : 0;
      const next = n + 1;
      sessionStorage.setItem(key, String(next));
      if (next >= 5) {
        // lock 30s
        sessionStorage.setItem(getLockKey(u), String(Date.now() + 30_000));
      }
    } catch {}
  }
  function clearFail(u: string) {
    try {
      sessionStorage.removeItem(getAttemptKey(u));
      sessionStorage.removeItem(getLockKey(u));
    } catch {}
  }

  return (
    <div className={styles.container}>
      <div className={styles.card} role="region" aria-labelledby="login-title">
        <h1 id="login-title" className={styles.title}>
          Sign in
        </h1>

        <form className={styles.form} onSubmit={handleLogin} noValidate>
          <label className={styles.label}>
            Username
            <input
              className={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              autoComplete="username"
              required
            />
          </label>

          <label className={styles.label}>
            Password
            <div style={{ position: "relative" }}>
              <input
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type={showPwd ? "text" : "password"}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className={styles.showPwdBtn}
                aria-label={showPwd ? "Hide password" : "Show password"}
                style={{ position: "absolute", right: 10, top: 8 }}
              >
                {showPwd ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {msg && (
            <div
              className={
                msg.type === "error" ? styles.errorBox : styles.successBox
              }
            >
              {msg.text}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button
              type="submit"
              className={styles.button}
              disabled={loading || isLocked}
              aria-disabled={loading || isLocked}
            >
              {loading ? "Signing in..." : isLocked ? "Locked" : "Sign in"}
            </button>

            <Link
              to="/register"
              style={{ textDecoration: "none", width: "100%" }}
            >
              <button
                type="button"
                className={styles.ghostBtn}
                style={{ width: "100%" }}
              >
                Create account
              </button>
            </Link>
          </div>
        </form>

        <p className={styles.registerText} style={{ marginTop: 12 }}>
          Need help?{" "}
          <Link to="/forgot" className={styles.link}>
            Forgot password
          </Link>
        </p>
      </div>
    </div>
  );
}
