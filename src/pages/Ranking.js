import { useState, useEffect } from "react";
import api from "../api";
import { countryFlag } from "../utils/flag";

const TROPHY = ["🥇", "🥈", "🥉"];
const TROPHY_COLOR = ["#f59e0b", "#94a3b8", "#cd7c3d"];

export default function Ranking() {
  const [paises, setPaises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getUsuariosPorPais()
      .then((r) => {
        const sorted = [...r.data].sort((a, b) => b.count - a.count);
        setPaises(sorted);
        setError(null);
      })
      .catch(() => setError("No se pudo conectar al microservicio de Usuarios"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (error)   return <p style={s.error}>❌ {error}</p>;

  const top3 = paises.slice(0, 3);
  const resto = paises.slice(3);
  const maxCount = paises[0]?.count || 1;

  return (
    <div>
      {/* Podio top 3 */}
      <div style={s.podio}>
        {top3.map((p, i) => (
          <div
            key={p.country}
            style={{ ...s.podioCard, borderTop: `3px solid ${TROPHY_COLOR[i]}` }}
          >
            <div style={s.podioFlag}>{countryFlag(p.country)}</div>
            <div style={s.podioTrophy}>{TROPHY[i]}</div>
            <div style={s.podioName}>
              {p.country || "Desconocido"}
            </div>
            <div style={s.podioCount}>
              {p.count.toLocaleString()} jugadores
            </div>
            <div style={s.barWrap}>
              <div
                style={{
                  ...s.bar,
                  width: `${(p.count / maxCount) * 100}%`,
                  background: TROPHY_COLOR[i],
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Tabla completa */}
      <div style={s.tableWrap}>
        <div style={s.tableHeader}>
          <span style={s.tableTitle}>Ranking Global por País</span>
          <span style={s.tableSub}>{paises.length} países registrados</span>
        </div>
        <table style={s.table}>
          <thead>
            <tr>
              {["Pos", "País", "Bandera", "Jugadores", "% del total"].map((h) => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paises.map((p, i) => {
              const pct = ((p.count / paises.reduce((acc, x) => acc + x.count, 0)) * 100).toFixed(1);
              return (
                <tr key={p.country} style={s.tr}>
                  <td style={{ ...s.td, color: i < 3 ? TROPHY_COLOR[i] : "#3a3f5c", fontWeight: i < 3 ? 700 : 400, width: 50 }}>
                    {i < 3 ? TROPHY[i] : i + 1}
                  </td>
                  <td style={{ ...s.td, fontWeight: 600, color: "#e8eaf0" }}>
                    {p.country || "Desconocido"}
                  </td>
                  <td style={{ ...s.td, fontSize: "1.4rem" }}>
                    {countryFlag(p.country)}
                  </td>
                  <td style={s.td}>
                    <div style={s.countCell}>
                      <div style={s.miniBarWrap}>
                        <div
                          style={{
                            ...s.miniBar,
                            width: `${(p.count / maxCount) * 100}%`,
                          }}
                        />
                      </div>
                      <span style={s.countNum}>{p.count.toLocaleString()}</span>
                    </div>
                  </td>
                  <td style={{ ...s.td, color: "#5a6080", fontSize: "0.82rem" }}>
                    {pct}%
                  </td>
                </tr>
              );
            })}
            {resto.length === 0 && paises.length === 3 && null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const s = {
  msg: { color: "#5a6080", padding: "2rem" },
  error: { color: "#ef4444", padding: "2rem" },
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
  },
  podioFlag: { fontSize: "3rem", lineHeight: 1 },
  podioTrophy: { fontSize: "1.4rem" },
  podioName: { fontWeight: 700, fontSize: "1.1rem", color: "#e8eaf0" },
  podioCount: { fontSize: "0.82rem", color: "#5a6080" },
  barWrap: { width: "100%", background: "rgba(255,255,255,0.07)", borderRadius: 4, height: 6, marginTop: 4 },
  bar: { height: 6, borderRadius: 4 },
  tableWrap: { background: "#272c4a", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" },
  tableHeader: {
    padding: "1rem 1.25rem",
    borderBottom: "1px solid #1c1f30",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tableTitle: { fontWeight: 600, fontSize: "0.95rem", color: "#e8eaf0" },
  tableSub: { fontSize: "0.8rem", color: "#5a6080" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "0.75rem 1rem",
    textAlign: "left",
    fontSize: "0.72rem",
    fontWeight: 600,
    color: "#4d6080",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1px solid #1c1f30",
    background: "#080d18",
  },
  tr: { borderBottom: "1px solid #1c1f30" },
  td: { padding: "0.75rem 1rem", fontSize: "0.88rem", color: "#94a3b8" },
  countCell: { display: "flex", alignItems: "center", gap: 10 },
  miniBarWrap: { flex: 1, background: "rgba(255,255,255,0.07)", borderRadius: 3, height: 5, maxWidth: 120 },
  miniBar: { height: 5, borderRadius: 3, background: "#f97316" },
  countNum: { fontWeight: 600, color: "#e8eaf0", minWidth: 50 },
};
