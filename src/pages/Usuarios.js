import { useState, useEffect } from "react";
import api from "../api";

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [estadisticas, setEstadisticas] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getUsuarios(pagina),
      api.getUsuariosPorPais(),
    ])
      .then(([usuariosRes, statsRes]) => {
        setUsuarios(usuariosRes.data);
        setEstadisticas(statsRes.data.slice(0, 5));
        setError(null);
      })
      .catch(() => setError("No se pudo conectar al microservicio de Usuarios"))
      .finally(() => setLoading(false));
  }, [pagina]);

  if (loading) return <p style={styles.msg}>⏳ Cargando usuarios...</p>;
  if (error) return <p style={styles.error}>❌ {error}</p>;

  return (
    <div>
      <h2 style={styles.titulo}>👥 Microservicio Usuarios</h2>
      <p style={styles.subtitulo}>
        Consumiendo: <code>GET /api/users/</code> y <code>GET /api/users/stats/by-country</code>
      </p>

      <div style={styles.grid}>
        {/* Tabla de usuarios */}
        <div style={styles.card}>
          <h3>Lista de Usuarios</h3>
          <table style={styles.tabla}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Username</th>
                <th style={styles.th}>Email</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} style={styles.tr}>
                  <td style={styles.td}>{u.id}</td>
                  <td style={styles.td}>{u.username}</td>
                  <td style={styles.td}>{u.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={styles.paginacion}>
            <button
              style={styles.btnPag}
              onClick={() => setPagina((p) => Math.max(0, p - 1))}
              disabled={pagina === 0}
            >
              ← Anterior
            </button>
            <span>Página {pagina + 1}</span>
            <button
              style={styles.btnPag}
              onClick={() => setPagina((p) => p + 1)}
            >
              Siguiente →
            </button>
          </div>
        </div>

        {/* Estadísticas por país */}
        <div style={styles.card}>
          <h3>Top 5 países</h3>
          <p style={styles.subtitulo}>Endpoint: <code>/api/users/stats/by-country</code></p>
          {estadisticas.map((e, i) => (
            <div key={i} style={styles.stat}>
              <span>{e.country || "Desconocido"}</span>
              <div style={styles.barraFondo}>
                <div
                  style={{
                    ...styles.barra,
                    width: `${(e.count / estadisticas[0].count) * 100}%`,
                  }}
                />
              </div>
              <span style={styles.count}>{e.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  titulo: { marginBottom: "0.25rem" },
  subtitulo: { color: "#666", fontSize: "0.9rem", marginBottom: "1.5rem" },
  msg: { color: "#666", fontSize: "1.1rem" },
  error: { color: "red" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" },
  card: {
    background: "white",
    borderRadius: "10px",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  tabla: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f5f5f5" },
  th: { padding: "10px 12px", textAlign: "left", fontWeight: "600", fontSize: "0.85rem" },
  tr: { borderBottom: "1px solid #eee" },
  td: { padding: "10px 12px", fontSize: "0.9rem" },
  paginacion: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "1rem",
    fontSize: "0.9rem",
  },
  btnPag: {
    background: "#1a1a2e",
    color: "white",
    border: "none",
    padding: "0.4rem 1rem",
    borderRadius: "6px",
    cursor: "pointer",
  },
  stat: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
    fontSize: "0.9rem",
  },
  barraFondo: {
    flex: 1,
    background: "#f0f0f0",
    borderRadius: "4px",
    height: "10px",
    overflow: "hidden",
  },
  barra: { height: "10px", background: "#e94560", borderRadius: "4px" },
  count: { color: "#666", minWidth: "40px", textAlign: "right" },
};

export default Usuarios;