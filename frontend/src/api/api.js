import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Instancia global de Axios para interactuar con la API del catálogo de juegos.
 */
export const api = axios.create({
  baseURL: API_BASE_URL.endsWith('/games') ? API_BASE_URL : `${API_BASE_URL}/games`,
  headers: {
    "Content-Type": "application/json"
  }
});

// Interceptor para inyectar token de autenticación JWT si existe sesión activa
api.interceptors.request.use(
  (config) => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const { token } = JSON.parse(savedUser);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // Ignorar errores de parseo en storage corrupto
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Helper para estandarizar los datos del juego preservando descuentos y precios.
 */
const formatGameData = (game) => {
  const finalPrice = game.price !== undefined ? Number(game.price) : (game.precio !== undefined ? Number(game.precio) : 29.99);
  const basePrice = game.precio_original !== undefined
    ? Number(game.precio_original)
    : (game.oldPrice ? Number(String(game.oldPrice).replace(/[^0-9.]/g, '')) : finalPrice);

  const discountPct = game.porcentaje_descuento || (game.discount ? Number(String(game.discount).replace(/[^0-9]/g, '')) : 0);
  const hasDiscount = Boolean(game.hasDiscount || (discountPct > 0) || (basePrice > finalPrice));

  return {
    ...game,
    id: game.id || game.id_juego,
    id_juego: game.id || game.id_juego,
    name: game.name || game.nombre || game.title,
    title: game.name || game.nombre || game.title,
    image: game.cover || game.image || game.imagen_url || "/nulls/placeholder-game.svg",
    cover: game.cover || game.image || game.imagen_url || "/nulls/placeholder-game.svg",
    coverUrl: game.cover || game.coverUrl || game.image || "/nulls/placeholder-game.svg",
    price: finalPrice,
    precio: finalPrice,
    oldPrice: hasDiscount ? (game.oldPrice || `$${basePrice.toFixed(2)}`) : null,
    precio_original: basePrice,
    discount: hasDiscount ? (game.discount || `-${discountPct}%`) : null,
    porcentaje_descuento: discountPct,
    hasDiscount,
    isOwned: Boolean(game.isOwned || game.inLibrary),
    inLibrary: Boolean(game.isOwned || game.inLibrary),
    genres: game.genres || []
  };
};

/**
 * Consulta los títulos destacados y en tendencia.
 */
export const gamesTraiding = async () => {
  try {
    const response = await api.get("/trending?limit=5");
    const gamesList = response.data.games || [];
    return gamesList.map(formatGameData);
  } catch {
    return [];
  }
};

/**
 * Consulta juegos recomendados y con mejores valoraciones.
 */
export const gamesRecommendations = async () => {
  try {
    const response = await api.get("/top-rated?limit=8");
    const gamesList = response.data.games || [];
    return gamesList.map((game) => {
      const formatted = formatGameData(game);
      return {
        ...formatted,
        rating: game.rating ? Math.round(game.rating / 20) : 4,
        genre: Array.isArray(game.genres) && game.genres.length > 0
          ? (typeof game.genres[0] === 'string' ? game.genres[0] : game.genres[0].name)
          : "Acción"
      };
    });
  } catch {
    return [];
  }
};

/**
 * Consulta ofertas activas y calcula precios promocionales.
 */
export const getAllDiscounts = async () => {
  try {
    const response = await api.get("/offers");
    const offersList = response.data.offers || [];
    if (offersList.length > 0) {
      return offersList.map((game) => {
        const formatted = formatGameData(game);
        return {
          ...formatted,
          description: game.summary ? `${game.summary.substring(0, 100)}...` : "Oferta por tiempo limitado."
        };
      });
    }

    // Fallback de demostración si no existen campañas en BD
    const fallbackRes = await api.get("/top-rated?limit=2");
    const fallbackList = fallbackRes.data.games || [];
    return fallbackList.map((game, index) => {
      const discountPct = index === 0 ? 50 : 30;
      const basePrice = game.precio ? Number(game.precio) : 59.99;
      const discountedPrice = Number((basePrice * (1 - discountPct / 100)).toFixed(2));
      return {
        ...game,
        id: game.id,
        title: game.name,
        name: game.name,
        image: game.cover || "/nulls/placeholder-game.svg",
        cover: game.cover || "/nulls/placeholder-game.svg",
        discount: `-${discountPct}%`,
        porcentaje_descuento: discountPct,
        oldPrice: `$${basePrice.toFixed(2)}`,
        precio_original: basePrice,
        price: discountedPrice,
        precio: discountedPrice,
        hasDiscount: true,
        isOwned: Boolean(game.isOwned || game.inLibrary),
        inLibrary: Boolean(game.isOwned || game.inLibrary),
        description: game.summary ? `${game.summary.substring(0, 100)}...` : "Oferta por tiempo limitado."
      };
    });
  } catch {
    return [];
  }
};

/**
 * Consulta catálogo adicional para la sección de exploración.
 */
export const getMoreGames = async () => {
  try {
    const response = await api.get("/explore?limit=6");
    const gamesList = response.data.games || [];
    return gamesList.map((game) => {
      const formatted = formatGameData(game);
      return {
        ...formatted,
        rating: game.rating ? Math.round(game.rating / 20) : 3,
        genre: Array.isArray(game.genres) && game.genres.length > 0
          ? (typeof game.genres[0] === 'string' ? game.genres[0] : game.genres[0].name)
          : "Aventura"
      };
    });
  } catch {
    return [];
  }
};

/**
 * Consulta la lista de géneros disponibles en el catálogo.
 */
export const getGenres = async () => {
  try {
    const response = await api.get("/genres");
    return response.data.genres || [];
  } catch {
    return [];
  }
};

/**
 * Consulta juegos con paginación, filtros de género, año y búsqueda por texto.
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
    const formattedGames = gamesList.map((game) => {
      const formatted = formatGameData(game);
      return {
        ...formatted,
        rating: game.rating ? Math.round(game.rating / 20) : 4,
        released: game.releaseDate ? String(game.releaseDate) : "2023"
      };
    });

    return {
      games: formattedGames,
      total: response.data.count || formattedGames.length
    };
  } catch {
    return { games: [], total: 0 };
  }
};

/**
 * Consulta los datos detallados de un juego por su identificador.
 */
export const getGameById = async (id) => {
  try {
    const response = await api.get(`/${id}`);
    const game = response.data.game;

    if (!game) return null;

    const formatted = formatGameData(game);

    return {
      ...formatted,
      description: game.summary || "Sin descripción disponible.",
      released: game.releaseDate ? `${game.releaseDate}-01-01` : "2023-01-01",
      genres: game.genres || ["Acción"],
      screenshots: game.screenshots || []
    };
  } catch {
    return null;
  }
};