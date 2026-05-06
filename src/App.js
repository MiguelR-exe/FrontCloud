import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Usuarios from "./pages/Usuarios";
import Juegos, { DetalleJuego } from "./pages/Juegos";
import Partidas from "./pages/Partidas";
import api from "./api";
import { useEffect } from "react";

const NAV_ITEMS = [
  { id: "usuarios", icon: "👥", label: "Usuarios", path: "/usuarios" },
  { id: "juegos",   icon: "🎮", label: "Juegos",   path: "/juegos"   },
  { id: "partidas", icon: "🕹️", label: "Partidas", path: "/partidas" },
];

const PAGE_META = {
  usuarios: { icon: "👥", label: "Usuarios",  sub: "Directorio de jugadores y leaderboard" },
  juegos:   { icon: "🎮", label: "Juegos",    sub: "Catálogo de videojuegos"               },
  partidas: { icon: "🕹️", label: "Partidas",  sub: "Tu historial de sesiones de juego"    },
};

function JuegoDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [juego, setJuego] = useState(null);

  useEffect(() => {
    api.getJuego(id)
      .then((r) => setJuego(r.data))
      .catch(() => navigate("/juegos"));
  }, [id]);

  if (!juego) return null;
  return (
    <div style={s.content}>
      <DetalleJuego juego={juego} onBack={() => navigate("/juegos")} />
    </div>
  );
}

function AppContent() {
  const { user, logout } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) {
    return showRegister
      ? <Register onSwitch={() => setShowRegister(false)} />
      : <Login    onSwitch={() => setShowRegister(true)}  />;
  }

  const segment = location.pathname.split("/")[1] || "usuarios";
  const meta = PAGE_META[segment] || PAGE_META.usuarios;

  return (
    <div style={s.root}>
      <aside style={s.sidebar}>
        <div style={s.sidebarTop}>
          <div style={s.logoBox}>
            <span style={s.logoIcon}>🎮</span>
            <span style={s.logoText}>GameBoard</span>
          </div>
          <div style={s.userBox}>
            <div style={s.avatar}>{user.username[0].toUpperCase()}</div>
            <div>
              <div style={s.userName}>{user.username}</div>
              <div style={s.userEmail}>{user.email}</div>
            </div>
          </div>
          <nav style={s.nav}>
            {NAV_ITEMS.map((item) => {
              const active = location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.id}
                  style={active ? s.navItemActive : s.navItem}
                  onClick={() => navigate(item.path)}
                >
                  <span style={s.navIcon}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
        <button style={s.logoutBtn} onClick={logout}>↩ Cerrar sesión</button>
      </aside>

      <main style={s.main}>
        <header style={s.header}>
          <h1 style={s.pageTitle}>{meta.icon} {meta.label}</h1>
          <p style={s.pageSubtitle}>{meta.sub}</p>
        </header>
        <Routes>
          <Route path="/" element={<Navigate to="/usuarios" replace />} />
          <Route path="/usuarios" element={<div style={s.content}><Usuarios /></div>} />
          <Route path="/juegos" element={<div style={s.content}><Juegos /></div>} />
          <Route path="/juegos/:id" element={<JuegoDetallePage />} />
          <Route path="/partidas" element={<div style={s.content}><Partidas /></div>} />
          <Route path="*" element={<Navigate to="/usuarios" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

const s = {
  root: { display: "flex", height: "100vh", background: "#080d18", color: "#e2e8f0", overflow: "hidden" },
  sidebar: { width: 220, background: "#050a12", borderRight: "1px solid rgba(148,163,184,0.08)", display: "flex", flexDirection: "column", justifyContent: "space-between", flexShrink: 0 },
  sidebarTop: { display: "flex", flexDirection: "column" },
  logoBox: { padding: "1.25rem", borderBottom: "1px solid rgba(148,163,184,0.08)", display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { fontSize: "1.5rem" },
  logoText: { fontWeight: 700, fontSize: "1rem", color: "#f97316", letterSpacing: "0.5px" },
  userBox: { padding: "1rem 1.25rem", borderBottom: "1px solid rgba(148,163,184,0.08)", display: "flex", alignItems: "center", gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#ea580c)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1rem", flexShrink: 0 },
  userName: { fontWeight: 600, fontSize: "0.85rem", color: "#e2e8f0" },
  userEmail: { fontSize: "0.72rem", color: "#4d6080", marginTop: 2 },
  nav: { padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: 2 },
  navItem: { display: "flex", alignItems: "center", gap: 10, padding: "0.6rem 0.9rem", background: "transparent", border: "none", borderRadius: 8, color: "#4d6080", fontSize: "0.88rem", cursor: "pointer", textAlign: "left", width: "100%" },
  navItemActive: { display: "flex", alignItems: "center", gap: 10, padding: "0.6rem 0.9rem", background: "rgba(249,115,22,0.12)", border: "none", borderRadius: 8, color: "#f97316", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer", textAlign: "left", width: "100%" },
  navIcon: { fontSize: "1rem" },
  logoutBtn: { margin: "1rem", padding: "0.6rem", background: "transparent", border: "1px solid rgba(148,163,184,0.1)", borderRadius: 8, color: "#4d6080", fontSize: "0.82rem", cursor: "pointer" },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  header: { padding: "1.1rem 2rem", borderBottom: "1px solid rgba(148,163,184,0.08)", background: "#050a12" },
  pageTitle: { fontSize: "1.2rem", fontWeight: 700, color: "#e2e8f0" },
  pageSubtitle: { fontSize: "0.78rem", color: "#4d6080", marginTop: 3 },
  content: { flex: 1, overflowY: "auto", padding: "1.5rem 2rem" },
};
