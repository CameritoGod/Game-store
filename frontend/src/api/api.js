import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Instancia global de Axios para peticiones directas o proxy hacia IGDB.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "text/plain",
    "Client-ID": import.meta.env.VITE_IGDB_CLIENT_ID,
    "Authorization": `Bearer ${import.meta.env.VITE_IGDB_ACCESS_TOKEN}`
  }
});

/**
 * Transforma la URL de portada provista por IGDB a HTTPS y al tamaño deseado.
 * @param {Object} cover Objeto de portada proveniente de IGDB.
 * @param {string} size Tamaño deseado para la imagen.
 * @returns {string} URL formateada o placeholder si no existe.
 */
const formatCoverUrl = (cover, size = "t_cover_big") => {
  if (!cover || !cover.url) {
    return "https://via.placeholder.com/264x352?text=No+Cover";
  }
  return cover.url.replace("//", "https://").replace("t_thumb", size);
};

/**
 * Obtiene los juegos con mayor valoración (tendencias) desde la API de IGDB.
 * @returns {Promise<Array>} Lista de juegos formateados.
 */
export const gamesTraiding = async () => {
  try {
    const query = `
      fields name, summary, rating, cover.url, genres.name, first_release_date;
      where rating != null & cover != null;
      sort rating desc;
      limit 5;
    `;

    const response = await api.post("/games", query);
    return response.data.map((game) => ({
      ...game,
      coverUrl: formatCoverUrl(game.cover, "t_1080p")
    }));
  } catch (error) {
    console.error("Error al obtener los juegos en tendencia:", error);
    throw error;
  }
};

/**
 * Obtiene juegos recomendados filtrados por alta valoración.
 * @returns {Promise<Array>} Lista de recomendaciones formateadas para componentes de tarjetas.
 */
export const gamesRecommendations = async () => {
  try {
    const query = `
      fields name, summary, rating, cover.url, genres.name, total_rating;
      where rating > 82 & cover != null;
      sort rating desc;
      limit 8;
    `;

    const response = await api.post("/games", query);
    return response.data.map((game) => ({
      id: game.id,
      title: game.name,
      image: formatCoverUrl(game.cover, "t_cover_big"),
      rating: game.rating ? Math.round(game.rating / 20) : 4,
      price: 59.99,
      genre: game.genres ? game.genres[0]?.name : "Acción"
    }));
  } catch (error) {
    console.error("Error al obtener recomendaciones:", error);
    throw error;
  }
};

/**
 * Simula la obtención de ofertas de la semana consultando juegos populares.
 * @returns {Promise<Array>} Lista de juegos en oferta con cálculo de descuento.
 */
export const getAllDiscounts = async () => {
  try {
    const query = `
      fields name, summary, rating, cover.url;
      where rating != null & cover != null;
      sort total_rating_count desc;
      limit 2;
    `;

    const response = await api.post("/games", query);
    return response.data.map((game, index) => {
      const discount = index === 0 ? 50 : 30;
      const originalPrice = 59.99;
      const discountedPrice = (originalPrice * (1 - discount / 100)).toFixed(2);

      return {
        id: game.id,
        title: game.name,
        image: formatCoverUrl(game.cover, "t_cover_big"),
        discount: `-${discount}%`,
        oldPrice: `$${originalPrice}`,
        newPrice: `$${discountedPrice}`,
        description: game.summary ? `${game.summary.substring(0, 100)}...` : "Oferta por tiempo limitado."
      };
    });
  } catch (error) {
    console.error("Error al obtener las ofertas:", error);
    throw error;
  }
};

/**
 * Obtiene una lista variada de juegos para la sección "Más Juegos".
 * @returns {Promise<Array>} Lista de juegos estructurados.
 */
export const getMoreGames = async () => {
  try {
    const query = `
      fields name, rating, cover.url, genres.name;
      where rating != null & cover != null;
      sort id desc;
      limit 6;
    `;

    const response = await api.post("/games", query);
    return response.data.map((game) => ({
      id: game.id,
      title: game.name,
      image: formatCoverUrl(game.cover, "t_cover_big"),
      rating: game.rating ? Math.round(game.rating / 20) : 3,
      price: 29.99,
      genre: game.genres ? game.genres[0]?.name : "Aventura"
    }));
  } catch (error) {
    console.error("Error al obtener catálogo adicional de juegos:", error);
    throw error;
  }
};

/**
 * Obtiene el detalle de un juego por su ID único.
 * @param {number|string} id ID del juego en IGDB.
 * @returns {Promise<Object>} Objeto con la información completa del juego.
 */
export const getGameById = async (id) => {
  try {
    const query = `
      fields name, summary, rating, cover.url, genres.name, first_release_date, platforms.name;
      where id = ${id};
    `;

    const response = await api.post("/games", query);
    const game = response.data[0];

    if (!game) return null;

    return {
      ...game,
      coverUrl: formatCoverUrl(game.cover, "t_1080p")
    };
  } catch (error) {
    console.error(`Error al obtener el juego con ID ${id}:`, error);
    throw error;
  }
};