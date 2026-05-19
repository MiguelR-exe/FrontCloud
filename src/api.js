import axios from "axios";

const API_GW = "https://jmqkaegv3c.execute-api.us-east-1.amazonaws.com";

const MS_USUARIOS = process.env.REACT_APP_MS_USUARIOS || API_GW;
const MS_JUEGOS   = process.env.REACT_APP_MS_JUEGOS   || API_GW;
const MS_PARTIDAS = process.env.REACT_APP_MS_PARTIDAS || API_GW;
const MS_RANKING  = process.env.REACT_APP_MS_RANKING  || API_GW;

const api = {
  // Auth
  login: (email, password) =>
    axios.post(`${MS_USUARIOS}/api/users/login`, { email, password }),

  register: (username, email, password) =>
    axios.post(`${MS_USUARIOS}/api/users/register`, { username, email, password }),

  // MS Usuarios
  getUsuarios: (page = 0, country = null, limit = 20) => {
    let url = `${MS_USUARIOS}/api/users/?skip=${page * limit}&limit=${limit}`;
    if (country) url += `&country=${encodeURIComponent(country)}`;
    return axios.get(url);
  },

  getUsuario: (id) =>
    axios.get(`${MS_USUARIOS}/api/users/${id}`),

  getUsuariosPorPais: () =>
    axios.get(`${MS_USUARIOS}/api/users/stats/by-country`),

  // MS Juegos
  getJuegos: (page = 1, genre = null, sort = null, order = null) => {
    let url = `${MS_JUEGOS}/api/games?page=${page}&limit=20`;
    if (genre) url += `&genre=${encodeURIComponent(genre)}`;
    if (sort) url += `&sort=${sort}&order=${order}`;
    return axios.get(url);
  },

  getJuego: (id) =>
    axios.get(`${MS_JUEGOS}/api/games/${id}`),

  getGeneros: () =>
    axios.get(`${MS_JUEGOS}/api/games/stats/genres`),

  // MS Partidas
  getPartidasUsuario: (userId) =>
    axios.get(`${MS_PARTIDAS}/api/sessions/user/${userId}`),

  getPartidasJuego: (gameId) =>
    axios.get(`${MS_PARTIDAS}/api/sessions/game/${gameId}`),

  crearPartida: (data) =>
    axios.post(`${MS_PARTIDAS}/api/sessions`, data),

  editarPartida: (id, data) =>
    axios.put(`${MS_PARTIDAS}/api/sessions/${id}`, data),

  eliminarPartida: (id) =>
    axios.delete(`${MS_PARTIDAS}/api/sessions/${id}`),

  // MS Ranking
  getLeaderboard: () =>
    axios.get(`${MS_RANKING}/api/ranking/leaderboard`),

  getRankingUsuario: (userId) =>
    axios.get(`${MS_RANKING}/api/ranking/user/${userId}`),
};

export default api;
