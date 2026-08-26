const igdbService = require('../services/igdb.service');
const priceService = require('../services/price.service');
const LibraryDAO = require('../dao/mysql/LibraryDAO');

const libraryDAO = new LibraryDAO();

/**
 * Función auxiliar para enriquecer juegos con:
 * 1. Precio determinista y constante basado en su ID (PriceService).
 * 2. Estado de propiedad en biblioteca (isOwned / inLibrary) si el usuario está autenticado.
 */
async function enrichGames(games, userId = null) {
  if (!games) return games;

  const isArray = Array.isArray(games);
  const gamesList = isArray ? games : [games];

  // Obtener Set de IDs comprados si existe usuario autenticado
  let ownedIdsSet = new Set();
  if (userId) {
    try {
      const ownedIds = await libraryDAO.getUserLibraryGameIds(userId);
      ownedIdsSet = new Set(ownedIds);
    } catch (e) {
      console.error('Error al obtener la biblioteca del usuario en enrichGames:', e.message);
    }
  }

  // Enriquecer cada juego con precio determinista y propiedad isOwned/inLibrary
  const enriched = gamesList.map((game) => {
    const gameWithPrice = priceService.attachPrice(game);
    const owned = ownedIdsSet.has(Number(gameWithPrice.id || gameWithPrice.id_juego));
    return {
      ...gameWithPrice,
      isOwned: owned,
      inLibrary: owned
    };
  });

  return isArray ? enriched : enriched[0];
}

// Buscar juegos
exports.searchGames = async (req, res, next) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'El término de búsqueda debe tener al menos 2 caracteres',
      });
    }

    const games = await igdbService.searchGames(q.trim(), parseInt(limit, 10));
    const enrichedGames = await enrichGames(games, req.user?.id_usuario);
    res.json({ success: true, count: enrichedGames.length, games: enrichedGames });
  } catch (error) {
    next(error);
  }
};

// Juegos mejor valorados
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

// Juegos Trending
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

// Obtener juego por ID
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

// Explorar juegos
exports.getAllGames = async (req, res, next) => {
  try {
    const { limit = 20, offset = 0, genre, year } = req.query;
    const parsedLimit = parseInt(limit, 10);
    const parsedOffset = parseInt(offset, 10);

    // Validar limit
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
      return res.status(400).json({ error: 'El límite debe estar entre 1 y 50' });
    }

    // validar offset
    if (isNaN(parsedOffset) || parsedOffset < 0) {
      return res.status(400).json({ error: 'El offset debe ser un número mayor o igual a 0' });
    }

    // Validar genero
    let genreId = null;
    if (genre !== undefined && genre !== '' && genre !== 'all') {
      genreId = parseInt(genre, 10);
      if (isNaN(genreId) || genreId <= 0) {
        return res.status(400).json({ error: 'El ID del género es inválido' });
      }
    }

    // Validar año
    let parsedYear = null;
    if (year !== undefined && year !== '' && String(year).trim().length === 4) {
      const tempYear = parseInt(year, 10);
      if (!isNaN(tempYear) && tempYear >= 1970 && tempYear <= 2100) {
        parsedYear = tempYear;
      }
    }

    // Consultar juegos con paginación y filtrado por género y año
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

// Obtener géneros
exports.getGenres = async (req, res, next) => {
  try {
    const genres = await igdbService.getGenres();
    res.json({ success: true, count: genres.length, genres });
  } catch (error) {
    next(error);
  }
};