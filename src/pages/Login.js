import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function Login({ onSwitch }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.login(form.email, form.password);
      login(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        <div style={styles.logo}>🎮</div>
        <h1 style={styles.title}>Game Leaderboard</h1>
        <p style={styles.subtitle}>Inicia sesión para continuar</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={styles.input}
              placeholder="tu@email.com"
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={styles.input}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? "Entrando..." : "Iniciar sesión"}
          </button>
        </form>

        <p style={styles.switchText}>
          ¿No tienes cuenta?{" "}
          <span style={styles.link} onClick={onSwitch}>
            Regístrate
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  bg: {
    minHeight: "100vh",
    background: "#080d18",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "2.5rem",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    textAlign: "center",
  },
  logo: { fontSize: "2.5rem", marginBottom: "0.5rem" },
  title: { margin: "0 0 0.25rem", fontSize: "1.6rem", color: "#1a1a2e" },
  subtitle: { color: "#888", fontSize: "0.9rem", margin: "0 0 2rem" },
  form: { textAlign: "left" },
  field: { marginBottom: "1.2rem" },
  label: { display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#444", marginBottom: "0.4rem" },
  input: {
    width: "100%",
    padding: "0.75rem 1rem",
    border: "1.5px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  error: { color: "#e94560", fontSize: "0.85rem", margin: "0 0 1rem", textAlign: "center" },
  btn: {
    width: "100%",
    padding: "0.85rem",
    background: "linear-gradient(135deg, #e94560, #c23152)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "0.5rem",
  },
  switchText: { marginTop: "1.5rem", fontSize: "0.9rem", color: "#666" },
  link: { color: "#e94560", cursor: "pointer", fontWeight: "600" },
};
