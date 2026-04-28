import axios from "axios";

const VM1 = "http://100.31.1.41";

const api = {
  // Auth
  login: (email, password) =>
    axios.post(`${VM1}:8001/api/users/login`, { email, password }),

  register: (username, email, password) =>
    axios.post(`${VM1}:8001/api/users/register`, { username, email, password }),

  // MS Usuarios
  getUsuarios: (page = 0) =>
    axios.get(`${VM1}:8001/api/users/?skip=${page * 20}&limit=20`),

  getUsuario: (id) =>
    axios.get(`${VM1}:8001/api/users/${id}`),

  getUsuariosPorPais: () =>
    axios.get(`${VM1}:8001/api/users/stats/by-country`),

  // MS Juegos
  getJuegos: (page = 1, genre = null, sort = null, order = "desc") => {
    let url = `${VM1}:8002/api/games?page=${page}&limit=20`;
    if (genre) url += `&genre=${encodeURIComponent(genre)}`;
    if (sort)  url += `&sort=${sort}&order=${order}`;
    return axios.get(url);
  },

  getGeneros: () =>
    axios.get(`${VM1}:8002/api/games/stats/genres`),
};

export default api;