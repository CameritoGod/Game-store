const igdbService = require('../services/igdb.service');

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
    res.json({ success: true, count: games.length, games });
  } catch (error) {
    next(error);
  }
};

// Juegos mejor valorados
exports.getTopRatedGames = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;
    const games = await igdbService.getTopRatedGames(parseInt(limit, 10));

    res.json({ success: true, count: games.length, games });
  } catch (error) {
    next(error);
  }
};

// Juegos Trending
exports.getTrendingGames = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;
    const games = await igdbService.getTrendingGames(parseInt(limit, 10));

    res.json({ success: true, count: games.length, games });
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

    res.json({ success: true, game });
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

    // Validar año (flexibilidad: si es incompleto o inválido, ignorar en lugar de 400)
    let parsedYear = null;
    if (year !== undefined && year !== '' && String(year).trim().length === 4) {
      const tempYear = parseInt(year, 10);
      if (!isNaN(tempYear) && tempYear >= 1970 && tempYear <= 2100) {
        parsedYear = tempYear;
      }
    }

    // Consultar juegos con paginación y filtrado por género y año
    const games = await igdbService.getAllGames(parsedLimit, parsedOffset, genreId, parsedYear);

    res.json({
      success: true,
      count: games.length,
      pagination: {
        limit: parsedLimit,
        offset: parsedOffset,
        nextOffset: parsedOffset + games.length,
      },
      filters: { genre: genreId, year: parsedYear },
      games,
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