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