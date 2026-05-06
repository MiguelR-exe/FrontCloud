import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const GENRE_COLORS = {
  FPS:             "#ef4444",
  RPG:             "#8b5cf6",
  MOBA:            "#3b82f6",
  "Battle Royale": "#f97316",
  Sports:          "#10b981",
  Strategy:        "#f59e0b",
  Puzzle:          "#06b6d4",
};

function gc(genre) { return GENRE_COLORS[genre] || "#6b7280"; }

function fmtDuration(secs) {
  if (!secs) return "—";
  const m = Math.floor(secs / 60), s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
function fmtDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

export function DetalleJuego({ juego, onBack }) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    api.getPartidasJuego(juego._id)
      .then((r) => setSessions(r.data))
      .catch(() => {});
  }, [juego._id]);

  const stars = juego.metadata?.rating ? Math.round(juego.metadata.rating) : 0;

  // Agrupa sesiones por userId para mostrar top jugadores
  const playerMap = {};
  sessions.forEach((sess) => {
    const id = sess.userId;
    if (!playerMap[id]) playerMap[id] = { userId: id, totalScore: 0, partidas: 0 };
    playerMap[id].totalScore += sess.score || 0;
    playerMap[id].partidas += 1;
  });
  const topJugadores = Object.values(playerMap).sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div>
      <button style={s.backBtn} onClick={onBack}>← Volver</button>

      <div style={{ ...s.detalleHero, borderTop: `4px solid ${gc(juego.genre)}` }}>
        <div style={{ ...s.detalleGenreIcon, background: `${gc(juego.genre)}22`, color: gc(juego.genre) }}>
          {juego.genre?.[0] || "?"}
        </div>
        <div style={s.detalleInfo}>
          <h2 style={s.detalleTitulo}>{juego.title}</h2>
          <div style={s.detalleMeta}>
            <span style={{ ...s.badge, background: `${gc(juego.genre)}22`, color: gc(juego.genre) }}>{juego.genre}</span>
            <span style={s.badgeGray}>{juego.platform}</span>
            {juego.metadata?.release_year && <span style={s.badgeGray}>{juego.metadata.release_year}</span>}
          </div>
        </div>
      </div>

      <div style={s.statsGrid}>
        <div style={s.statCard}>
          <p style={s.statVal}>{"⭐".repeat(stars)}{"☆".repeat(5 - stars)}</p>
          <p style={s.statLabel}>Rating</p>
          <p style={{ color: "#f59e0b", fontSize: "1rem", marginTop: 4 }}>
            {juego.metadata?.rating ? Number(juego.metadata.rating).toFixed(1) : "—"} / 5
          </p>
        </div>
        <div style={s.statCard}>
          <p style={s.statVal}>{juego.platform || "—"}</p>
          <p style={s.statLabel}>Plataforma</p>
        </div>
        <div style={s.statCard}>
          <p style={s.statVal}>{sessions.length.toLocaleString()}</p>
          <p style={s.statLabel}>Partidas jugadas</p>
        </div>
      </div>

      {juego.metadata?.developer && (
        <div style={s.infoCard}>
          <p style={s.infoLabel}>Desarrollador</p>
          <p style={s.infoVal}>{juego.metadata.developer}</p>
        </div>
      )}

      {juego.tags?.length > 0 && (
        <div style={s.infoCard}>
          <p style={s.infoLabel}>Tags</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            {juego.tags.map((t, i) => <span key={i} style={s.tag}>{t}</span>)}
          </div>
        </div>
      )}

      {/* Tabla de jugadores */}
      <div style={s.sesionesWrap}>
        <div style={s.sesionesHeader}>
          <span style={s.sesionesTitle}>Jugadores</span>
          <span style={s.sesionesSub}> — {topJugadores.length} jugadores · {sessions.length} sesiones</span>
        </div>
        {topJugadores.length === 0 ? (
          <p style={s.empty}>Sin sesiones registradas.</p>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {["#", "Usuario ID", "Partidas", "Score total"].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topJugadores.map((p, i) => (
                <tr key={p.userId} style={s.tr}>
                  <td style={{ ...s.td, color: "#3a4060" }}>{i + 1}</td>
                  <td style={{ ...s.td, color: "#e8eaf0", fontWeight: 600 }}>#{p.userId}</td>
                  <td style={{ ...s.td, color: "#94a3b8" }}>{p.partidas}</td>
                  <td style={{ ...s.td, color: "#f97316", fontWeight: 700 }}>{p.totalScore.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function Juegos() {
  const navigate = useNavigate();
  const [juegos, setJuegos] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [filtroGenero, setFiltroGenero] = useState(null);
  const [sortVal, setSortVal] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getGeneros()
      .then((gr) => setGeneros(gr.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const [sort, order] = sortVal ? sortVal.split("_") : [null, "desc"];
    api.getJuegos(pagina, filtroGenero, sort, order)
      .then((jr) => { setJuegos(jr.data); setError(null); })
      .catch(() => setError("No se pudo conectar al microservicio de Juegos"));
  }, [pagina, filtroGenero, sortVal]);

  if (error) return <p style={s.error}>❌ {error}</p>;

  const handleFiltro = (genero) => {
    setFiltroGenero(genero === filtroGenero ? null : genero);
    setPagina(1);
  };

  const handleSort = (val) => {
    setSortVal(val);
    setPagina(1);
  };

  return (
    <div>
      <div style={s.filtrosRow}>
        <div style={s.filtros}>
          <button style={filtroGenero === null ? s.filtroBtnActive : s.filtroBtn} onClick={() => handleFiltro(null)}>
            Todos
          </button>
          {generos.map((g) => (
            <button
              key={g._id}
              style={filtroGenero === g._id
                ? { ...s.filtroBtnActive, background: `${gc(g._id)}22`, color: gc(g._id), borderColor: gc(g._id) }
                : s.filtroBtn}
              onClick={() => handleFiltro(g._id)}
            >
              {g._id}
            </button>
          ))}
        </div>
        <select style={s.sortSelect} value={sortVal} onChange={(e) => handleSort(e.target.value)}>
          <option value="">Ordenar por…</option>
          <option value="rating_desc">Rating ↓</option>
          <option value="rating_asc">Rating ↑</option>
          <option value="genre_asc">Género A→Z</option>
          <option value="genre_desc">Género Z→A</option>
          <option value="title_asc">Título A→Z</option>
          <option value="title_desc">Título Z→A</option>
        </select>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {["#", "Título", "Género", "Plataforma", "Dev", "Rating", "Año"].map((h) => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {juegos.map((g, i) => (
              <tr key={g._id} style={{ ...s.tr, cursor: "pointer" }} onClick={() => navigate(`/juegos/${g._id}`)}>
                <td style={{ ...s.td, color: "#3a4060", width: 40 }}>{(pagina - 1) * 20 + i + 1}</td>
                <td style={{ ...s.td, fontWeight: 600, color: "#e8eaf0" }}>{g.title}</td>
                <td style={s.td}>
                  <span
                    style={{ ...s.badge, background: `${gc(g.genre)}22`, color: gc(g.genre), cursor: "pointer" }}
                    onClick={(e) => { e.stopPropagation(); setFiltroGenero(g.genre === filtroGenero ? null : g.genre); }}
                  >{g.genre}</span>
                </td>
                <td style={{ ...s.td, color: "#94a3b8" }}>{g.platform}</td>
                <td style={{ ...s.td, color: "#7a82a8", fontSize: "0.8rem" }}>{g.metadata?.developer || "—"}</td>
                <td style={s.td}>
                  {g.metadata?.rating != null && (
                    <span style={s.rating}>⭐ {Number(g.metadata.rating).toFixed(1)}</span>
                  )}
                </td>
                <td style={{ ...s.td, color: "#7a82a8", fontSize: "0.8rem" }}>{g.metadata?.release_year || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={s.paginacion}>
          <button style={s.btnPag} onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={pagina === 1}>
            ← Anterior
          </button>
          <span style={s.paginaLabel}>Página {pagina}</span>
          <button style={s.btnPag} onClick={() => setPagina((p) => p + 1)}>Siguiente →</button>
        </div>
      </div>
    </div>
  );
}

const s = {
  error: { color: "#ef4444", padding: "2rem" },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    color: "#e8eaf0",
    fontSize: "0.85rem",
    padding: "0.5rem 1rem",
    cursor: "pointer",
    marginBottom: "1.5rem",
  },
  detalleHero: {
    background: "#0f1829",
    borderRadius: 14,
    padding: "2rem",
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    marginBottom: "1rem",
    border: "1px solid rgba(148,163,184,0.08)",
  },
  detalleGenreIcon: {
    width: 72, height: 72, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "2rem", fontWeight: 700, flexShrink: 0,
  },
  detalleInfo: { display: "flex", flexDirection: "column", gap: 10 },
  detalleTitulo: { fontSize: "1.5rem", fontWeight: 700, color: "#e8eaf0", margin: 0 },
  detalleMeta: { display: "flex", gap: 8, flexWrap: "wrap" },
  statsGrid: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem", marginBottom: "1rem",
  },
  statCard: {
    background: "#0f1829", borderRadius: 12, padding: "1.25rem",
    textAlign: "center", border: "1px solid rgba(255,255,255,0.07)",
  },
  statVal: { fontSize: "1.3rem", fontWeight: 700, color: "#e8eaf0", marginBottom: 4 },
  statLabel: { fontSize: "0.72rem", color: "#7a82a8", textTransform: "uppercase", letterSpacing: "0.05em" },
  infoCard: {
    background: "#0f1829", borderRadius: 12, padding: "1.25rem",
    marginBottom: "1rem", border: "1px solid rgba(255,255,255,0.07)",
  },
  infoLabel: { fontSize: "0.72rem", color: "#7a82a8", textTransform: "uppercase", letterSpacing: "0.05em" },
  infoVal: { fontSize: "0.95rem", color: "#e8eaf0", marginTop: 4 },
  tag: {
    background: "rgba(255,255,255,0.07)", color: "#94a3b8",
    padding: "3px 10px", borderRadius: 20, fontSize: "0.8rem",
  },
  sesionesWrap: { background: "#272c4a", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)", marginTop: "1rem" },
  sesionesHeader: { padding: "1rem 1.25rem", borderBottom: "1px solid #1c1f30" },
  sesionesTitle: { fontWeight: 600, fontSize: "0.95rem", color: "#e8eaf0" },
  sesionesSub: { fontSize: "0.8rem", color: "#5a6080" },
  empty: { color: "#5a6080", padding: "1rem 1.25rem", fontSize: "0.88rem" },
  filtrosRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem",
  },
  filtros: { display: "flex", gap: "0.5rem", flexWrap: "wrap", flex: 1 },
  sortSelect: {
    background: "#0f1829",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    color: "#94a3b8",
    fontSize: "0.8rem",
    padding: "0.35rem 0.75rem",
    cursor: "pointer",
    outline: "none",
    flexShrink: 0,
  },
  filtroBtn: {
    padding: "0.35rem 0.85rem", background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20,
    color: "#4d6080", fontSize: "0.8rem", cursor: "pointer",
  },
  filtroBtnActive: {
    padding: "0.35rem 0.85rem", background: "rgba(249,115,22,0.15)",
    border: "1px solid #f97316", borderRadius: 20,
    color: "#f97316", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600,
  },
  tableWrap: { background: "#272c4a", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "0.75rem 1rem", textAlign: "left",
    fontSize: "0.72rem", fontWeight: 600, color: "#7a82a8",
    textTransform: "uppercase", letterSpacing: "0.05em",
    borderBottom: "1px solid rgba(148,163,184,0.08)", background: "#080d18",
  },
  tr: { borderBottom: "1px solid rgba(255,255,255,0.05)" },
  td: { padding: "0.7rem 1rem", fontSize: "0.85rem", color: "#94a3b8" },
  badge: { padding: "3px 10px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 600 },
  badgeGray: {
    background: "rgba(255,255,255,0.07)", color: "#94a3b8",
    padding: "3px 10px", borderRadius: 20, fontSize: "0.78rem",
  },
  rating: { fontSize: "0.82rem", color: "#f59e0b" },
  paginacion: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0.9rem 1rem", borderTop: "1px solid rgba(255,255,255,0.07)",
  },
  paginaLabel: { fontSize: "0.85rem", color: "#7a82a8" },
  btnPag: {
    background: "rgba(255,255,255,0.07)", color: "#94a3b8",
    border: "none", borderRadius: 7, padding: "0.45rem 1rem",
    fontSize: "0.83rem", cursor: "pointer",
  },
};
