import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Instancia global de Axios para conectar con el backend de la aplicación Node.js / Express.
 */
export const api = axios.create({
  baseURL: API_BASE_URL.endsWith('/games') ? API_BASE_URL : `${API_BASE_URL}/games`,
  headers: {
    "Content-Type": "application/json"
  }
});

/**
 * Obtiene los juegos con mayor valoración (tendencias) desde el Backend.
 * @returns {Promise<Array>} Lista de juegos formateados para CardTendencia.
 */
export const gamesTraiding = async () => {
  try {
    const response = await api.get("/trending?limit=5");
    const gamesList = response.data.games || [];
    return gamesList.map((game) => ({
      ...game,
      coverUrl: game.cover || "https://via.placeholder.com/1080x720?text=No+Cover",
      cover: {
        url: game.cover || "https://via.placeholder.com/1080x720?text=No+Cover"
      },
      genres: (game.genres || []).map(g => (typeof g === 'string' ? { name: g } : g))
    }));
  } catch (error) {
    console.error("Error al obtener los juegos en tendencia:", error);
    return [];
  }
};

/**
 * Obtiene juegos recomendados desde el Backend.
 * @returns {Promise<Array>} Lista de recomendaciones formateadas para componentes de tarjetas.
 */
export const gamesRecommendations = async () => {
  try {
    const response = await api.get("/top-rated?limit=8");
    const gamesList = response.data.games || [];
    return gamesList.map((game) => ({
      id: game.id,
      title: game.name,
      image: game.cover || "https://via.placeholder.com/264x352?text=No+Cover",
      rating: game.rating ? Math.round(game.rating / 20) : 4,
      price: 59.99,
      genre: Array.isArray(game.genres) && game.genres.length > 0 ? game.genres[0] : "Acción"
    }));
  } catch (error) {
    console.error("Error al obtener recomendaciones:", error);
    return [];
  }
};

/**
 * Obtiene las ofertas de la semana consultando juegos top del Backend.
 * @returns {Promise<Array>} Lista de juegos en oferta con cálculo de descuento.
 */
export const getAllDiscounts = async () => {
  try {
    const response = await api.get("/top-rated?limit=2");
    const gamesList = response.data.games || [];
    return gamesList.map((game, index) => {
      const discount = index === 0 ? 50 : 30;
      const originalPrice = 59.99;
      const discountedPrice = (originalPrice * (1 - discount / 100)).toFixed(2);

      return {
        id: game.id,
        title: game.name,
        image: game.cover || "https://via.placeholder.com/264x352?text=No+Cover",
        discount: `-${discount}%`,
        oldPrice: `$${originalPrice}`,
        newPrice: `$${discountedPrice}`,
        description: game.summary ? `${game.summary.substring(0, 100)}...` : "Oferta por tiempo limitado."
      };
    });
  } catch (error) {
    console.error("Error al obtener las ofertas:", error);
    return [];
  }
};

/**
 * Obtiene una lista variada de juegos para la sección "Más Juegos".
 * @returns {Promise<Array>} Lista de juegos estructurados.
 */
export const getMoreGames = async () => {
  try {
    const response = await api.get("/explore?limit=6");
    const gamesList = response.data.games || [];
    return gamesList.map((game) => ({
      id: game.id,
      title: game.name,
      image: game.cover || "https://via.placeholder.com/264x352?text=No+Cover",
      rating: game.rating ? Math.round(game.rating / 20) : 3,
      price: 29.99,
      genre: Array.isArray(game.genres) && game.genres.length > 0 ? game.genres[0] : "Aventura"
    }));
  } catch (error) {
    console.error("Error al obtener catálogo adicional de juegos:", error);
    return [];
  }
};

/**
 * Obtiene la lista completa de géneros desde el Backend.
 * @returns {Promise<Array>} Lista de géneros [{ id, name, slug }].
 */
export const getGenres = async () => {
  try {
    const response = await api.get("/genres");
    return response.data.genres || [];
  } catch (error) {
    console.error("Error al obtener la lista de géneros:", error);
    return [];
  }
};

/**
 * Obtiene juegos con paginación y filtros para la vista AllGames.jsx.
 * @param {Object} params { page, genre, year, search }
 * @returns {Promise<Object>} { games, total }
 */
export const gamesAll = async ({ page = 1, genre = "all", year = "", search = "" } = {}) => {
  try {
    const limit = 12;
    const offset = (page - 1) * limit;

    let response;
    if (search && search.trim().length >= 2) {
      response = await api.get(`/search?q=${encodeURIComponent(search.trim())}&limit=${limit}`);
    } else {
      let queryUrl = `/explore?limit=${limit}&offset=${offset}`;
      if (genre && genre !== "all" && !isNaN(genre)) {
        queryUrl += `&genre=${genre}`;
      }
      if (year && !isNaN(year)) {
        queryUrl += `&year=${year}`;
      }
      response = await api.get(queryUrl);
    }

    const gamesList = response.data.games || [];
    const formattedGames = gamesList.map((game) => ({
      id: game.id,
      name: game.name,
      image: game.cover || "/nulls/placeholder-game.svg",
      rating: game.rating ? Math.round(game.rating / 20) : 4,
      released: game.releaseDate ? String(game.releaseDate) : "2023",
      genres: game.genres || []
    }));

    return {
      games: formattedGames,
      total: response.data.count || formattedGames.length
    };
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.warn("Filtro o consulta sin resultados (HTTP 400):", error.response.data?.error || error.message);
    } else {
      console.error("Error al consultar todos los juegos:", error.message);
    }
    return { games: [], total: 0 };
  }
};

/**
 * Obtiene el detalle de un juego por su ID único desde el Backend.
 * @param {number|string} id ID del juego.
 * @returns {Promise<Object|null>} Objeto con la información completa del juego.
 */
export const getGameById = async (id) => {
  try {
    const response = await api.get(`/${id}`);
    const game = response.data.game;

    if (!game) return null;

    return {
      ...game,
      image: game.cover || "https://via.placeholder.com/1080x720?text=No+Cover",
      coverUrl: game.cover || "https://via.placeholder.com/1080x720?text=No+Cover",
      description: game.summary || "Sin descripción disponible.",
      released: game.releaseDate ? `${game.releaseDate}-01-01` : "2023-01-01",
      genres: game.genres || ["Acción"],
      screenshots: game.screenshots || []
    };
  } catch (error) {
    console.error(`Error al obtener el juego con ID ${id}:`, error);
    return null;
  }
};