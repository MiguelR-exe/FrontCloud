import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";

const TROPHY       = ["🥇", "🥈", "🥉"];
const TROPHY_COLOR = ["#f59e0b", "#94a3b8", "#cd7c3d"];

export default function Ranking() {
  const { user } = useAuth();
  const [top10, setTop10]     = useState([]);
  const [myRank, setMyRank]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    api.getTop10()
      .then((r) => { setTop10(r.data); setError(null); })
      .catch(() => setError("No se pudo conectar al microservicio de Ranking"))
      .finally(() => setLoading(false));

    if (user?.id) {
      api.getRankingUsuario(user.id)
        .then((r) => setMyRank(r.data))
        .catch(() => {}); // 404 = usuario sin partidas, no es error
    }
  }, [user]);

  if (loading) return null;
  if (error)   return <p style={s.error}>❌ {error}</p>;

  const top3  = top10.slice(0, 3);
  const resto = top10.slice(3);

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

      {/* Podio top 3 */}
      <div style={s.podio}>
        {top3.map((p, i) => (
          <div key={p.userId} style={{ ...s.podioCard, borderTop: `3px solid ${TROPHY_COLOR[i]}` }}>
            <div style={{ ...s.podioAvatar, background: `${TROPHY_COLOR[i]}22`, color: TROPHY_COLOR[i] }}>
              {(p.username || "?")[0].toUpperCase()}
            </div>
            <div style={s.podioTrophy}>{TROPHY[i]}</div>
            <div style={s.podioName}>{p.username}</div>
            <div style={s.podioScore}>{(p.totalScore || 0).toLocaleString()} pts</div>
          </div>
        ))}
      </div>

      {/* Tabla resto */}
      {resto.length > 0 && (
        <div style={s.tableWrap}>
          <div style={s.tableHeader}>
            <span style={s.tableTitle}>Leaderboard completo</span>
            <span style={s.tableSub}>Top {top10.length} jugadores</span>
          </div>
          <table style={s.table}>
            <thead>
              <tr>
                {["Pos", "Jugador", "Puntuación total"].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resto.map((p, i) => (
                <tr key={p.userId} style={s.tr}>
                  <td style={{ ...s.td, color: "#5a6080", width: 60 }}>{i + 4}</td>
                  <td style={s.td}>
                    <div style={s.playerCell}>
                      <div style={s.smallAvatar}>{(p.username || "?")[0].toUpperCase()}</div>
                      <span style={{ fontWeight: 500, color: "#e8eaf0" }}>{p.username}</span>
                    </div>
                  </td>
                  <td style={{ ...s.td, color: "#f97316", fontWeight: 700 }}>
                    {(p.totalScore || 0).toLocaleString()} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {top10.length === 0 && (
        <p style={s.empty}>No hay partidas registradas aún. ¡Juega una para aparecer aquí!</p>
      )}
    </div>
  );
}

const s = {
  error: { color: "#ef4444", padding: "2rem" },
  empty: { color: "#5a6080", padding: "2rem" },
  myRankCard: {
    background: "#0f1829",
    border: "1px solid rgba(249,115,22,0.3)",
    borderRadius: 12,
    padding: "1rem 1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
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
  podio: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" },
  podioCard: {
    background: "#0f1829", borderRadius: 12, padding: "1.5rem",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
    border: "1px solid rgba(255,255,255,0.06)",
  },
  podioAvatar: {
    width: 52, height: 52, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1.4rem", fontWeight: 700,
  },
  podioTrophy: { fontSize: "1.4rem" },
  podioName: { fontWeight: 700, fontSize: "1.05rem", color: "#e8eaf0" },
  podioScore: { fontSize: "0.82rem", color: "#5a6080" },
  tableWrap: { background: "#272c4a", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" },
  tableHeader: {
    padding: "1rem 1.25rem", borderBottom: "1px solid #1c1f30",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  tableTitle: { fontWeight: 600, fontSize: "0.95rem", color: "#e8eaf0" },
  tableSub: { fontSize: "0.8rem", color: "#5a6080" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "0.75rem 1rem", textAlign: "left",
    fontSize: "0.72rem", fontWeight: 600, color: "#4d6080",
    textTransform: "uppercase", letterSpacing: "0.05em",
    borderBottom: "1px solid #1c1f30", background: "#080d18",
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
};
