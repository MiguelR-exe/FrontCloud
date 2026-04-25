import { useState, useEffect } from "react";
import api from "../api";

function Juegos() {
  const [juegos, setJuegos] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getJuegos(pagina),
      api.getGeneros(),
    ])
      .then(([juegosRes, generosRes]) => {
        setJuegos(juegosRes.data);
        setGeneros(generosRes.data.slice(0, 6));
        setError(null);
      })
      .catch(() => setError("No se pudo conectar al microservicio de Juegos"))
      .finally(() => setLoading(false));
  }, [pagina]);

  if (loading) return <p>⏳ Cargando juegos...</p>;
  if (error) return <p style={{ color: "red" }}>❌ {error}</p>;

  return (
    <div>
      <h2 style={{ marginBottom: "0.25rem" }}>🎮 Microservicio Juegos</h2>
      <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        Consumiendo: <code>GET /api/games</code> y <code>GET /api/games/stats/genres</code>
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Lista de juegos */}
        <div style={styles.card}>
          <h3>Catálogo de Juegos</h3>
          <table style={styles.tabla}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={styles.th}>Título</th>
                <th style={styles.th}>Género</th>
                <th style={styles.th}>Plataforma</th>
              </tr>
            </thead>
            <tbody>
              {juegos.map((g) => (
                <tr key={g._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={styles.td}>{g.title}</td>
                  <td style={styles.td}>
                    <span style={styles.badge}>{g.genre}</span>
                  </td>
                  <td style={styles.td}>{g.platform}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={styles.paginacion}>
            <button
              style={styles.btnPag}
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina === 1}
            >
              ← Anterior
            </button>
            <span>Página {pagina}</span>
            <button
              style={styles.btnPag}
              onClick={() => setPagina((p) => p + 1)}
            >
              Siguiente →
            </button>
          </div>
        </div>

        {/* Géneros */}
        <div style={styles.card}>
          <h3>Juegos por Género</h3>
          <p style={{ color: "#666", fontSize: "0.85rem" }}>
            Endpoint: <code>/api/games/stats/genres</code>
          </p>
          {generos.map((g, i) => (
            <div key={i} style={styles.generoFila}>
              <span style={styles.generoNombre}>{g._id}</span>
              <div style={styles.barraFondo}>
                <div
                  style={{
                    ...styles.barra,
                    width: `${(g.count / generos[0].count) * 100}%`,
                    background: colores[i % colores.length],
                  }}
                />
              </div>
              <span style={styles.generoCount}>{g.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const colores = ["#e94560", "#0f3460", "#533483", "#2b9348", "#e76f51", "#457b9d"];

const styles = {
  card: {
    background: "white",
    borderRadius: "10px",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  tabla: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "10px 12px", textAlign: "left", fontWeight: "600", fontSize: "0.85rem" },
  td: { padding: "10px 12px", fontSize: "0.9rem" },
  badge: {
    background: "#f0f0f0",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "0.8rem",
  },
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
  generoFila: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "14px",
    fontSize: "0.9rem",
  },
  generoNombre: { minWidth: "110px" },
  barraFondo: {
    flex: 1,
    background: "#f0f0f0",
    borderRadius: "4px",
    height: "12px",
    overflow: "hidden",
  },
  barra: { height: "12px", borderRadius: "4px", transition: "width 0.5s" },
  generoCount: { color: "#666", minWidth: "40px", textAlign: "right" },
};

export default Juegos;