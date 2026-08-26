const express = require('express');
const router = express.Router();
const gamesController = require('../controllers/games.controller');
const optionalAuth = require('../middleware/optionalAuthMiddleware');

// Búsqueda
router.get('/search', optionalAuth, gamesController.searchGames);

// Juegos mejor valorados
router.get('/top-rated', optionalAuth, gamesController.getTopRatedGames);

// Juegos Trending
router.get('/trending', optionalAuth, gamesController.getTrendingGames);

// Obtener géneros
router.get('/genres', gamesController.getGenres);

// Ofertas activas públicas
router.get('/offers', optionalAuth, gamesController.getActiveOffers);

// Juegos para explorar (con paginación y filtrado por género)
router.get('/explore', optionalAuth, gamesController.getAllGames);

// Juego por ID
router.get('/:id', optionalAuth, gamesController.getGameById);

module.exports = router;