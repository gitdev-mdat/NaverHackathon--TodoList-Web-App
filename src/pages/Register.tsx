// src/pages/Register.tsx
import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "../styles/Login.module.css"; // re-use and extend

// helper: hash string with SHA-256 and return hex
async function sha256Hex(input: string) {
  const enc = new TextEncoder();
  const data = enc.encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(hash);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// simple password strength estimation
function passwordStrengthScore(pw: string) {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return Math.min(score, 5); // 0..5
}

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const navigate = useNavigate();

  // validation rules (lenient)
  const usernameClean = username.trim();
  const usernameValid = usernameClean.length >= 1 && usernameClean.length <= 32; // relaxed: 1..32 chars
  const passwordScore = passwordStrengthScore(password);
  const passwordValid = password.length >= 8;
  const passwordsMatch = password === confirm && password.length > 0;

  const canSubmit =
    usernameValid && passwordValid && passwordsMatch && !loading;

  const pwdStrengthLabel = useMemo(() => {
    switch (passwordScore) {
      case 0:
      case 1:
        return "Very weak";
      case 2:
        return "Weak";
      case 3:
        return "Fair";
      case 4:
        return "Strong";
      case 5:
        return "Very strong";
      default:
        return "";
    }
  }, [passwordScore]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const u = usernameClean;
    if (!usernameValid) {
      setError("Please enter a username (1–32 characters).");
      return;
    }
    if (!passwordValid) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // load existing users (array) from localStorage
      const raw = localStorage.getItem("users") || "[]";
      let users: Array<{
        username: string;
        passwordHash: string;
        createdAt?: string;
      }>;
      try {
        users = JSON.parse(raw);
        if (!Array.isArray(users)) users = [];
      } catch {
        users = [];
      }

      if (users.find((uObj) => uObj.username === u)) {
        setError("Username already exists. Pick another one.");
        setLoading(false);
        return;
      }

      const hash = await sha256Hex(password);

      const newUser = {
        username: u,
        passwordHash: hash,
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));

      setSuccessMsg("Registered successfully — redirecting to login...");
      // small pause so user sees message
      setTimeout(() => {
        navigate("/login");
      }, 900);
    } catch (err: any) {
      console.error("register error", err);
      setError("Registration failed — check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div
        className={styles.card}
        role="region"
        aria-labelledby="register-title"
      >
        <h1 id="register-title" className={styles.title}>
          Create an account
        </h1>

        <form className={styles.form} onSubmit={handleRegister} noValidate>
          <label className={styles.label}>
            Username
            <input
              type="text"
              inputMode="text"
              autoCapitalize="off"
              autoComplete="username"
              placeholder="e.g. jane.doe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              required
              aria-invalid={!usernameValid && username.length > 0}
            />
            <div className={styles.hintRow}>
              <small className={styles.hint}>1–32 characters</small>
              {!usernameValid && username.length > 0 && (
                <small className={styles.errorText}>Invalid username</small>
              )}
            </div>
          </label>

          <label className={styles.label}>
            Password
            <div style={{ position: "relative" }}>
              <input
                type={showPwd ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
                aria-describedby="pwd-strength"
                aria-invalid={!passwordValid && password.length > 0}
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className={styles.showPwdBtn ?? ""}
                aria-label={showPwd ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: 10,
                  top: 8,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "var(--muted)",
                }}
              >
                {showPwd ? "Hide" : "Show"}
              </button>
            </div>
            <div className={styles.hintRow}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <small id="pwd-strength" className={styles.hint}>
                  Strength: {pwdStrengthLabel}
                </small>
                <div
                  aria-hidden
                  style={{
                    width: 96,
                    height: 8,
                    background: "#eef2ff",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(passwordScore / 5) * 100}%`,
                      height: "100%",
                      background:
                        passwordScore <= 2
                          ? "#fb7185"
                          : passwordScore === 3
                          ? "#f59e0b"
                          : "#10b981",
                      borderRadius: 8,
                      transition: "width 200ms ease",
                    }}
                  />
                </div>
              </div>

              {!passwordValid && password.length > 0 && (
                <small className={styles.errorText}>Password too short</small>
              )}
            </div>
          </label>

          <label className={styles.label}>
            Confirm password
            <div style={{ position: "relative" }}>
              <input
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Repeat password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={styles.input}
                required
                aria-invalid={!passwordsMatch && confirm.length > 0}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className={styles.showPwdBtn ?? ""}
                aria-label={
                  showConfirm ? "Hide confirmation" : "Show confirmation"
                }
                style={{
                  position: "absolute",
                  right: 10,
                  top: 8,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "var(--muted)",
                }}
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
            <div className={styles.hintRow}>
              {!passwordsMatch && confirm.length > 0 && (
                <small className={styles.errorText}>
                  Passwords do not match
                </small>
              )}
            </div>
          </label>

          {error && <div className={styles.errorBox}>{error}</div>}
          {successMsg && <div className={styles.successBox}>{successMsg}</div>}

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button
              type="submit"
              className={styles.button}
              disabled={!canSubmit}
              aria-disabled={!canSubmit}
            >
              {loading ? "Registering..." : "Create account"}
            </button>

            <button
              type="button"
              className={styles.ghostBtn}
              onClick={() => navigate("/login")}
            >
              Back to login
            </button>
          </div>
        </form>

        <p className={styles.registerText}>
          Already have an account?{" "}
          <Link to="/login" className={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
