const igdbService = require('../services/igdb.service');
const priceService = require('../services/price.service');
const LibraryDAO = require('../dao/mysql/LibraryDAO');
const DiscountDAO = require('../dao/mysql/DiscountDAO');
const CatalogDAO = require('../dao/mysql/CatalogDAO');

const libraryDAO = new LibraryDAO();
const discountDAO = new DiscountDAO();
const catalogDAO = new CatalogDAO();

/**
 * Enriquece datos de juegos con precios comerciales, ofertas vigentes y estado de posesión en biblioteca.
 */
async function enrichGames(games, userId = null) {
  if (!games) return games;

  const isArray = Array.isArray(games);
  const gamesList = isArray ? games : [games];

  // 1. Obtener mapa de descuentos activos hoy
  let activeDiscountsMap = new Map();
  try {
    activeDiscountsMap = await discountDAO.getAllActiveDiscountsMap();
  } catch {
    activeDiscountsMap = new Map();
  }

  // 2. Obtener mapa de precios de catálogo comercial activo
  let catalogMap = new Map();
  try {
    const catalogRows = await catalogDAO.findAll();
    for (const cat of catalogRows) {
      if (cat.activo) {
        catalogMap.set(Number(cat.id_juego), parseFloat(cat.precio_actual));
      }
    }
  } catch {
    catalogMap = new Map();
  }

  // 3. Obtener identificadores de juegos en biblioteca si hay sesión activa
  let ownedIdsSet = new Set();
  if (userId) {
    try {
      const ownedIds = await libraryDAO.getUserLibraryGameIds(userId);
      ownedIdsSet = new Set(ownedIds);
    } catch {
      ownedIdsSet = new Set();
    }
  }

  // 4. Vincular precios, descuentos y flags isOwned / inLibrary
  const enriched = gamesList.map((game) => {
    const gameWithPriceAndDiscount = priceService.attachPrice(game, activeDiscountsMap, catalogMap);
    const owned = ownedIdsSet.has(Number(gameWithPriceAndDiscount.id || gameWithPriceAndDiscount.id_juego));
    return {
      ...gameWithPriceAndDiscount,
      isOwned: owned,
      inLibrary: owned
    };
  });

  return isArray ? enriched : enriched[0];
}

/**
 * Busca juegos en el catálogo mediante IGDB con algoritmo de relevancia.
 */
exports.searchGames = async (req, res, next) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'El término de búsqueda debe tener al menos 2 caracteres'
      });
    }

    const games = await igdbService.searchGames(q.trim(), parseInt(limit, 10));
    const enrichedGames = await enrichGames(games, req.user?.id_usuario);
    res.json({ success: true, count: enrichedGames.length, games: enrichedGames });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene los títulos con mejor puntuación agregada.
 */
exports.getTopRatedGames = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;
    const games = await igdbService.getTopRatedGames(parseInt(limit, 10));
    const enrichedGames = await enrichGames(games, req.user?.id_usuario);

    res.json({ success: true, count: enrichedGames.length, games: enrichedGames });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene juegos con mayor popularidad y tendencia actual.
 */
exports.getTrendingGames = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;
    const games = await igdbService.getTrendingGames(parseInt(limit, 10));
    const enrichedGames = await enrichGames(games, req.user?.id_usuario);

    res.json({ success: true, count: enrichedGames.length, games: enrichedGames });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene el detalle completo de un juego específico por ID.
 */
exports.getGameById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'ID de juego inválido' });
    }

    const game = await igdbService.getGameById(parseInt(id, 10));

    if (!game) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }

    const enrichedGame = await enrichGames(game, req.user?.id_usuario);

    res.json({ success: true, game: enrichedGame });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene el catálogo exploratorio con paginación y filtros por género y año.
 */
exports.getAllGames = async (req, res, next) => {
  try {
    const { limit = 20, offset = 0, genre, year } = req.query;
    const parsedLimit = parseInt(limit, 10);
    const parsedOffset = parseInt(offset, 10);

    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
      return res.status(400).json({ error: 'El límite debe estar entre 1 y 50' });
    }

    if (isNaN(parsedOffset) || parsedOffset < 0) {
      return res.status(400).json({ error: 'El offset debe ser un número mayor o igual a 0' });
    }

    let genreId = null;
    if (genre !== undefined && genre !== '' && genre !== 'all') {
      genreId = parseInt(genre, 10);
      if (isNaN(genreId) || genreId <= 0) {
        return res.status(400).json({ error: 'El ID del género es inválido' });
      }
    }

    let parsedYear = null;
    if (year !== undefined && year !== '' && String(year).trim().length === 4) {
      const tempYear = parseInt(year, 10);
      if (!isNaN(tempYear) && tempYear >= 1970 && tempYear <= 2100) {
        parsedYear = tempYear;
      }
    }

    const games = await igdbService.getAllGames(parsedLimit, parsedOffset, genreId, parsedYear);
    const enrichedGames = await enrichGames(games, req.user?.id_usuario);

    res.json({
      success: true,
      count: enrichedGames.length,
      pagination: {
        limit: parsedLimit,
        offset: parsedOffset,
        nextOffset: parsedOffset + enrichedGames.length,
      },
      filters: { genre: genreId, year: parsedYear },
      games: enrichedGames,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene el listado de géneros disponibles en IGDB.
 */
exports.getGenres = async (req, res, next) => {
  try {
    const genres = await igdbService.getGenres();
    res.json({ success: true, count: genres.length, genres });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene la lista de juegos con ofertas activas vigentes.
 */
exports.getActiveOffers = async (req, res, next) => {
  try {
    const activeDiscountsMap = await discountDAO.getAllActiveDiscountsMap();
    if (!activeDiscountsMap || activeDiscountsMap.size === 0) {
      return res.json({ success: true, count: 0, offers: [] });
    }

    const gameIds = Array.from(activeDiscountsMap.keys());
    const gamesList = [];

    for (const gId of gameIds) {
      try {
        const game = await igdbService.getGameById(gId);
        if (game) {
          gamesList.push(game);
        }
      } catch {
        // Omisión silenciosa de juego no disponible en IGDB
      }
    }

    const enriched = await enrichGames(gamesList, req.user?.id_usuario);
    const offersArray = Array.isArray(enriched) ? enriched : (enriched ? [enriched] : []);
    const activeOffersOnly = offersArray.filter(g => g && g.hasDiscount);

    res.json({ success: true, count: activeOffersOnly.length, offers: activeOffersOnly });
  } catch (error) {
    next(error);
  }
};