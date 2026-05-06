import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import { countryFlag } from "../utils/flag";
import { SesionesTabla } from "./Partidas";

/* ── Perfil individual ──────────────────────────────────────────── */
function PerfilUsuario({ userId, rankMap, onBack }) {
  const [perfil, setPerfil]     = useState(null);
  const [sesiones, setSesiones] = useState([]);
  const [error, setError]       = useState(null);

  useEffect(() => {
    api.getUsuario(userId)
      .then((r) => setPerfil(r.data))
      .catch(() => setError("No se pudo cargar el perfil"));
    api.getPartidasUsuario(userId)
      .then((r) => setSesiones(r.data))
      .catch(() => {});
  }, [userId]);

  if (error)   return <p style={s.error}>❌ {error}</p>;
  if (!perfil) return null;

  const rankData = rankMap[String(perfil.id)];

  return (
    <div>
      <button style={s.backBtn} onClick={onBack}>← Volver</button>

      <div style={s.perfilCard}>
        <div style={s.perfilAvatar}>{perfil.username[0].toUpperCase()}</div>
        <div style={s.perfilInfo}>
          <h2 style={s.perfilNombre}>{perfil.username}</h2>
          <p style={s.perfilEmail}>{perfil.email}</p>
          {perfil.profile?.country && (
            <p style={s.perfilPais}>{countryFlag(perfil.profile.country)} {perfil.profile.country}</p>
          )}
          <span style={s.perfilId}>ID #{perfil.id}</span>
        </div>
      </div>

      {perfil.profile?.bio && (
        <div style={s.bioCard}>
          <p style={s.bioLabel}>Bio</p>
          <p style={s.bioText}>{perfil.profile.bio}</p>
        </div>
      )}

      <div style={s.statsGrid}>
        <div style={s.statCard}>
          <p style={s.statVal}>{perfil.profile?.country || "—"}</p>
          <p style={s.statLabel}>País</p>
        </div>
        <div style={s.statCard}>
          <p style={s.statVal}>{rankData ? `#${rankData.rank}` : "—"}</p>
          <p style={s.statLabel}>Posición ranking</p>
        </div>
        <div style={s.statCard}>
          <p style={s.statVal}>{rankData ? rankData.totalScore.toLocaleString() : "—"}</p>
          <p style={s.statLabel}>Puntuación total</p>
        </div>
      </div>

      <div style={s.seccionTitle}>Partidas recientes</div>
      <SesionesTabla sessions={sesiones.slice(0, 10)} />
    </div>
  );
}

/* ── Componente principal ───────────────────────────────────────── */
const SORT_OPTIONS = [
  { value: "puntos_desc", label: "Ranking" },
  { value: "nombre_asc",  label: "Nombre A→Z" },
  { value: "nombre_desc", label: "Nombre Z→A" },
];

export default function Usuarios() {
  const { user }  = useAuth();
  const [usuarios, setUsuarios]   = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [paises, setPaises]       = useState([]);
  const [rankMap, setRankMap]     = useState({});
  const [myRank, setMyRank]       = useState(null);
  const [pagina, setPagina]       = useState(0);
  const [sort, setSort]           = useState("puntos_desc");
  const [filtroPais, setFiltroPais] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError]         = useState(null);

  const PAGE_SIZE = 20;

  useEffect(() => {
    const cached = sessionStorage.getItem("leaderboard");
    if (cached) {
      const data = JSON.parse(cached);
      setLeaderboard(data);
      const map = {};
      data.forEach((entry, i) => {
        map[String(entry.userId)] = { rank: i + 1, totalScore: entry.totalScore };
      });
      setRankMap(map);
      return;
    }
    api.getLeaderboard()
      .then((r) => {
        setLeaderboard(r.data);
        const map = {};
        r.data.forEach((entry, i) => {
          map[String(entry.userId)] = { rank: i + 1, totalScore: entry.totalScore };
        });
        setRankMap(map);
        sessionStorage.setItem("leaderboard", JSON.stringify(r.data));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.id) {
      api.getRankingUsuario(user.id)
        .then((r) => setMyRank(r.data))
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    api.getUsuariosPorPais()
      .then((r) => setPaises(r.data.map((p) => p.country).filter(Boolean).sort()))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (filtroPais && sort === "puntos_desc") {
      // Cargar todos los del país para poder cruzar con leaderboard
      api.getUsuarios(0, filtroPais, 5000)
        .then((r) => { setUsuarios(r.data); setError(null); })
        .catch(() => setError("No se pudo conectar al microservicio de Usuarios"));
    } else if (sort !== "puntos_desc") {
      api.getUsuarios(pagina, filtroPais || null)
        .then((r) => { setUsuarios(r.data); setError(null); })
        .catch(() => setError("No se pudo conectar al microservicio de Usuarios"));
    }
  }, [pagina, sort, filtroPais]);

  const sorted = useMemo(() => {
    if (sort === "puntos_desc") {
      // Si hay filtro de país, cruzar leaderboard con usuarios del país (que ya tienen ranking)
      let base = leaderboard;
      if (filtroPais) {
        const paisIds = new Set(usuarios.map((u) => String(u.id)));
        base = leaderboard.filter((e) => paisIds.has(String(e.userId)));
      }
      return base.slice(pagina * PAGE_SIZE, (pagina + 1) * PAGE_SIZE).map((e) => {
        const u = usuarios.find((x) => String(x.id) === String(e.userId));
        return { id: e.userId, username: e.username, country: u?.country || null, email: u?.email || null };
      });
    }
    const list = [...usuarios];
    switch (sort) {
      case "nombre_asc":  return list.sort((a, b) => a.username.localeCompare(b.username));
      case "nombre_desc": return list.sort((a, b) => b.username.localeCompare(a.username));
      default: return list;
    }
  }, [usuarios, leaderboard, sort, pagina, filtroPais]);

  if (selectedId)
    return <PerfilUsuario userId={selectedId} rankMap={rankMap} onBack={() => setSelectedId(null)} />;
  if (error) return <p style={s.error}>❌ {error}</p>;

  return (
    <div>
      {/* Tu posición */}
      {myRank && (
        <div style={s.myRankCard}>
          <div style={s.myRankLeft}>
            <div style={s.myRankAvatar}>{user.username[0].toUpperCase()}</div>
            <div>
              <p style={s.myRankName}>{user.username}</p>
              <p style={s.myRankSub}>Tu posición global</p>
            </div>
          </div>
          <div style={s.myRankRight}>
            <span style={s.myRankPos}>#{myRank.rank}</span>
            <span style={s.myRankScore}>{(myRank.data?.totalScore || 0).toLocaleString()} pts</span>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div style={s.filtrosRow}>
        <span style={s.filtrosLabel}>Ordenar por:</span>
        <div style={s.filtros}>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              style={sort === opt.value ? s.filtroBtnActive : s.filtroBtn}
              onClick={() => { setSort(opt.value); setPagina(0); setFiltroPais(""); }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <select
          style={s.paisSelect}
          value={filtroPais}
          onChange={(e) => { setFiltroPais(e.target.value); setPagina(0); }}
        >
          <option value="">🌍 Todos los países</option>
          {paises.map((p) => (
            <option key={p} value={p}>{countryFlag(p)} {p}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {["Jugador", "País", "Email", "Ranking", "Puntos"].map((h) => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((u) => {
              const rd = rankMap[String(u.id)];
              return (
                <tr key={u.id} style={{ ...s.tr, cursor: "pointer" }} onClick={() => setSelectedId(u.id)}>
                  <td style={s.td}>
                    <div style={s.playerCell}>
                      <div style={s.smallAvatar}>{u.username[0].toUpperCase()}</div>
                      <span style={s.playerName}>{u.username}</span>
                    </div>
                  </td>
                  <td style={s.td}>
                    {u.country
                      ? <span style={s.flagBadge}>{countryFlag(u.country)} {u.country}</span>
                      : <span style={s.na}>—</span>}
                  </td>
                  <td style={{ ...s.td, color: "#7a82a8", fontSize: "0.82rem" }}>{u.email}</td>
                  <td style={{ ...s.td, color: rd ? "#f97316" : "#3a4060", fontWeight: rd ? 700 : 400 }}>
                    {rd ? `#${rd.rank}` : "—"}
                  </td>
                  <td style={{ ...s.td, color: rd ? "#e8eaf0" : "#3a4060" }}>
                    {rd ? rd.totalScore.toLocaleString() : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={s.paginacion}>
          <button style={s.btnPag} onClick={() => setPagina((p) => Math.max(0, p - 1))} disabled={pagina === 0}>
            ← Anterior
          </button>
          <span style={s.paginaLabel}>Página {pagina + 1}</span>
          <button style={s.btnPag} onClick={() => setPagina((p) => p + 1)}>Siguiente →</button>
        </div>
      </div>
    </div>
  );
}

const s = {
  error: { color: "#ef4444", padding: "2rem" },
  backBtn: {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8, color: "#e8eaf0", fontSize: "0.85rem",
    padding: "0.5rem 1rem", cursor: "pointer", marginBottom: "1.5rem",
  },
  perfilCard: {
    background: "#0f1829", borderRadius: 14, padding: "2rem",
    display: "flex", alignItems: "center", gap: "1.5rem",
    marginBottom: "1rem", border: "1px solid rgba(148,163,184,0.08)",
  },
  perfilAvatar: {
    width: 80, height: 80, borderRadius: "50%",
    background: "linear-gradient(135deg,#f97316,#ea580c)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "2rem", fontWeight: 700, flexShrink: 0,
  },
  perfilInfo: { display: "flex", flexDirection: "column", gap: 4 },
  perfilNombre: { fontSize: "1.5rem", fontWeight: 700, color: "#e8eaf0", margin: 0 },
  perfilEmail: { fontSize: "0.88rem", color: "#7a82a8" },
  perfilPais: { fontSize: "1rem", color: "#e8eaf0" },
  perfilId: {
    display: "inline-block", background: "rgba(249,115,22,0.15)",
    color: "#f97316", fontSize: "0.78rem", padding: "2px 10px",
    borderRadius: 20, marginTop: 4,
  },
  bioCard: {
    background: "#0f1829", borderRadius: 12, padding: "1.25rem",
    marginBottom: "1rem", border: "1px solid rgba(148,163,184,0.08)",
  },
  bioLabel: { fontSize: "0.72rem", color: "#7a82a8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 },
  bioText: { fontSize: "0.9rem", color: "#c8cad8", lineHeight: 1.6 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" },
  statCard: {
    background: "#0f1829", borderRadius: 12, padding: "1.25rem",
    textAlign: "center", border: "1px solid rgba(148,163,184,0.08)",
  },
  statVal: { fontSize: "1.4rem", fontWeight: 700, color: "#f97316", marginBottom: 4 },
  statLabel: { fontSize: "0.75rem", color: "#7a82a8", textTransform: "uppercase", letterSpacing: "0.05em" },
  seccionTitle: { fontSize: "0.78rem", fontWeight: 600, color: "#4d6080", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" },
  myRankCard: {
    background: "#0f1829", border: "1px solid rgba(249,115,22,0.3)",
    borderRadius: 12, padding: "1rem 1.5rem",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: "1.25rem",
  },
  myRankLeft: { display: "flex", alignItems: "center", gap: "1rem" },
  myRankAvatar: {
    width: 40, height: 40, borderRadius: "50%",
    background: "linear-gradient(135deg,#f97316,#ea580c)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: "1rem",
  },
  myRankName: { fontWeight: 600, color: "#e8eaf0", fontSize: "0.95rem" },
  myRankSub: { fontSize: "0.75rem", color: "#5a6080", marginTop: 2 },
  myRankRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 },
  myRankPos: { fontSize: "1.4rem", fontWeight: 700, color: "#f97316" },
  myRankScore: { fontSize: "0.8rem", color: "#7a82a8" },
  filtrosRow: {
    display: "flex", alignItems: "center", gap: "0.75rem",
    flexWrap: "wrap", marginBottom: "1rem",
  },
  paisSelect: {
    background: "#0f1829", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8, color: "#94a3b8", fontSize: "0.8rem",
    padding: "0.35rem 0.75rem", cursor: "pointer", outline: "none",
    marginLeft: "auto",
  },
  filtrosLabel: { fontSize: "0.78rem", color: "#4d6080", flexShrink: 0 },
  filtros: { display: "flex", gap: "0.4rem", flexWrap: "wrap" },
  filtroBtn: {
    padding: "0.3rem 0.85rem", background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20,
    color: "#4d6080", fontSize: "0.78rem", cursor: "pointer",
  },
  filtroBtnActive: {
    padding: "0.3rem 0.85rem", background: "rgba(249,115,22,0.15)",
    border: "1px solid #f97316", borderRadius: 20,
    color: "#f97316", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
  },
  tableWrap: { background: "#272c4a", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.72rem",
    fontWeight: 600, color: "#4d6080", textTransform: "uppercase",
    letterSpacing: "0.05em", borderBottom: "1px solid rgba(255,255,255,0.07)",
    background: "#080d18",
  },
  tr: { borderBottom: "1px solid rgba(255,255,255,0.05)" },
  td: { padding: "0.75rem 1rem", fontSize: "0.88rem", color: "#94a3b8" },
  playerCell: { display: "flex", alignItems: "center", gap: 10 },
  smallAvatar: {
    width: 28, height: 28, borderRadius: "50%",
    background: "rgba(249,115,22,0.15)", color: "#f97316",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "0.75rem", fontWeight: 700, flexShrink: 0,
  },
  playerName: { fontWeight: 500, color: "#e8eaf0" },
  flagBadge: {
    background: "rgba(255,255,255,0.07)", padding: "2px 8px",
    borderRadius: 20, fontSize: "0.8rem", color: "#94a3b8",
  },
  na: { color: "#3a4060" },
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
