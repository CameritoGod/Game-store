const express = require('express');
const router = express.Router();
const gamesController = require('../controllers/games.controller');

// Búsqueda
router.get('/search', gamesController.searchGames);

// Juegos mejor valorados
router.get('/top-rated', gamesController.getTopRatedGames);

// Juegos Trending
router.get('/trending', gamesController.getTrendingGames);

// Juego por ID
router.get('/:id', gamesController.getGameById);

module.exports = router;