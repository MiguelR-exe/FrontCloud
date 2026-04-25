import axios from "axios";

// Cambia esta IP por la IP pública de tu VM1
const VM1 = "http://3.94.197.147";

const api = {
  // MS Usuarios - método 1
  getUsuarios: (page = 0) =>
    axios.get(`${VM1}:8001/api/users/?skip=${page * 20}&limit=20`),

  // MS Usuarios - método 2
  getUsuariosPorPais: () =>
    axios.get(`${VM1}:8001/api/users/stats/by-country`),

  // MS Juegos - método 1
  getJuegos: (page = 1) =>
    axios.get(`${VM1}:8002/api/games?page=${page}&limit=20`),

  // MS Juegos - método 2
  getGeneros: () =>
    axios.get(`${VM1}:8002/api/games/stats/genres`),
};

export default api;