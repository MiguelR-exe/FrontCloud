import { useState, useEffect } from "react";
import api from "../api";
import { countryFlag } from "../utils/flag";

const TROPHY = ["🥇", "🥈", "🥉"];
const TROPHY_COLOR = ["#f59e0b", "#94a3b8", "#cd7c3d"];

function PerfilUsuario({ userId, onBack }) {
  const [perfil, setPerfil] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getUsuario(userId)
      .then((r) => setPerfil(r.data))
      .catch(() => setError("No se pudo cargar el perfil"));
  }, [userId]);

  if (error) return <p style={s.error}>❌ {error}</p>;
  if (!perfil) return null;

  return (
    <div>
      <button style={s.backBtn} onClick={onBack}>← Volver</button>

      <div style={s.perfilCard}>
        <div style={s.perfilAvatar}>{perfil.username[0].toUpperCase()}</div>
        <div style={s.perfilInfo}>
          <h2 style={s.perfilNombre}>{perfil.username}</h2>
          <p style={s.perfilEmail}>{perfil.email}</p>
          {perfil.profile?.country && (
            <p style={s.perfilPais}>
              {countryFlag(perfil.profile.country)} {perfil.profile.country}
            </p>
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
          <p style={s.statVal}>#{perfil.id}</p>
          <p style={s.statLabel}>ID de jugador</p>
        </div>
        <div style={s.statCard}>
          <p style={s.statVal}>{perfil.profile?.country ? countryFlag(perfil.profile.country) : "🌍"}</p>
          <p style={s.statLabel}>Región</p>
        </div>
      </div>
    </div>
  );
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getUsuarios(pagina)
      .then((r) => { setUsuarios(r.data); setError(null); })
      .catch(() => setError("No se pudo conectar al microservicio de Usuarios"));
  }, [pagina]);

  if (selectedId) return <PerfilUsuario userId={selectedId} onBack={() => setSelectedId(null)} />;
  if (error) return <p style={s.error}>❌ {error}</p>;

  const top3 = usuarios.slice(0, 3);
  const resto = usuarios.slice(3);

  return (
    <div>
      <div style={s.podio}>
        {top3.map((u, i) => (
          <div
            key={u.id}
            style={{ ...s.podioCard, borderTop: `3px solid ${TROPHY_COLOR[i]}`, cursor: "pointer" }}
            onClick={() => setSelectedId(u.id)}
          >
            <div style={{ ...s.podioAvatar, background: `${TROPHY_COLOR[i]}22`, color: TROPHY_COLOR[i] }}>
              {u.username[0].toUpperCase()}
            </div>
            <div style={s.podioTrophy}>{TROPHY[i]}</div>
            <div style={s.podioName}>{u.username}</div>
            <div style={s.podioMeta}>
              {u.country && <span style={s.podioFlag}>{countryFlag(u.country)} {u.country}</span>}
            </div>
            <div style={s.podioEmail}>{u.email}</div>
            <div style={s.podioRank}>#{pagina * 20 + i + 1}</div>
          </div>
        ))}
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {["Pos", "Jugador", "País", "Email", "ID"].map((h) => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resto.map((u, i) => (
              <tr
                key={u.id}
                style={{ ...s.tr, cursor: "pointer" }}
                onClick={() => setSelectedId(u.id)}
              >
                <td style={{ ...s.td, color: "#7a82a8", width: 50 }}>{pagina * 20 + i + 4}</td>
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
                <td style={{ ...s.td, color: "#3a4060", fontSize: "0.8rem" }}>#{u.id}</td>
              </tr>
            ))}
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
  perfilCard: {
    background: "#0f1829",
    borderRadius: 14,
    padding: "2rem",
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    marginBottom: "1rem",
    border: "1px solid rgba(148,163,184,0.08)",
  },
  perfilAvatar: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#f97316,#ea580c)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    fontWeight: 700,
    flexShrink: 0,
  },
  perfilInfo: { display: "flex", flexDirection: "column", gap: 4 },
  perfilNombre: { fontSize: "1.5rem", fontWeight: 700, color: "#e8eaf0", margin: 0 },
  perfilEmail: { fontSize: "0.88rem", color: "#7a82a8" },
  perfilPais: { fontSize: "1rem", color: "#e8eaf0" },
  perfilId: {
    display: "inline-block",
    background: "rgba(249,115,22,0.15)",
    color: "#f97316",
    fontSize: "0.78rem",
    padding: "2px 10px",
    borderRadius: 20,
    marginTop: 4,
  },
  bioCard: {
    background: "#0f1829",
    borderRadius: 12,
    padding: "1.25rem",
    marginBottom: "1rem",
    border: "1px solid rgba(148,163,184,0.08)",
  },
  bioLabel: { fontSize: "0.72rem", color: "#7a82a8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 },
  bioText: { fontSize: "0.9rem", color: "#c8cad8", lineHeight: 1.6 },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  statCard: {
    background: "#0f1829",
    borderRadius: 12,
    padding: "1.25rem",
    textAlign: "center",
    border: "1px solid rgba(148,163,184,0.08)",
  },
  statVal: { fontSize: "1.4rem", fontWeight: 700, color: "#e8eaf0", marginBottom: 4 },
  statLabel: { fontSize: "0.75rem", color: "#7a82a8", textTransform: "uppercase", letterSpacing: "0.05em" },
  podio: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  podioCard: {
    background: "#0f1829",
    borderRadius: 12,
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    position: "relative",
    border: "1px solid rgba(255,255,255,0.06)",
    transition: "background 0.15s",
  },
  podioAvatar: {
    width: 56, height: 56, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1.4rem", fontWeight: 700,
  },
  podioTrophy: { fontSize: "1.5rem", marginTop: -8 },
  podioName: { fontWeight: 700, fontSize: "1rem", color: "#e8eaf0" },
  podioMeta: { fontSize: "0.85rem" },
  podioFlag: { color: "#94a3b8" },
  podioEmail: { fontSize: "0.75rem", color: "#3a4060" },
  podioRank: { position: "absolute", top: 12, right: 14, fontSize: "0.75rem", color: "#3a4060" },
  tableWrap: { background: "#272c4a", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "0.75rem 1rem",
    textAlign: "left",
    fontSize: "0.72rem",
    fontWeight: 600,
    color: "#4d6080",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    background: "#080d18",
  },
  tr: { borderBottom: "1px solid rgba(255,255,255,0.05)" },
  td: { padding: "0.75rem 1rem", fontSize: "0.88rem", color: "#c8cad8" },
  playerCell: { display: "flex", alignItems: "center", gap: 10 },
  smallAvatar: {
    width: 28, height: 28, borderRadius: "50%",
    background: "rgba(249,115,22,0.15)", color: "#f97316",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "0.75rem", fontWeight: 700, flexShrink: 0,
  },
  playerName: { fontWeight: 500 },
  flagBadge: {
    background: "rgba(255,255,255,0.07)",
    padding: "2px 8px", borderRadius: 20,
    fontSize: "0.8rem", color: "#94a3b8",
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
