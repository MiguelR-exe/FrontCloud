import { useState } from "react";
import Usuarios from "./pages/Usuarios";
import Juegos from "./pages/Juegos";
import "./App.css";

function App() {
  const [pagina, setPagina] = useState("usuarios");

  return (
    <div>
      <nav style={styles.nav}>
        <span style={styles.logo}>🎮 Game Leaderboard</span>
        <div>
          <button
            style={pagina === "usuarios" ? styles.btnActivo : styles.btn}
            onClick={() => setPagina("usuarios")}
          >
            Usuarios
          </button>
          <button
            style={pagina === "juegos" ? styles.btnActivo : styles.btn}
            onClick={() => setPagina("juegos")}
          >
            Juegos
          </button>
        </div>
      </nav>

      <div style={styles.contenido}>
        {pagina === "usuarios" && <Usuarios />}
        {pagina === "juegos" && <Juegos />}
      </div>
    </div>
  );
}

const styles = {
  nav: {
    background: "#1a1a2e",
    color: "white",
    padding: "1rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: { fontSize: "1.4rem", fontWeight: "bold" },
  btn: {
    background: "transparent",
    color: "white",
    border: "1px solid #444",
    padding: "0.5rem 1.2rem",
    marginLeft: "0.5rem",
    borderRadius: "6px",
    cursor: "pointer",
  },
  btnActivo: {
    background: "#e94560",
    color: "white",
    border: "none",
    padding: "0.5rem 1.2rem",
    marginLeft: "0.5rem",
    borderRadius: "6px",
    cursor: "pointer",
  },
  contenido: { padding: "2rem" },
};

export default App;