const express = require('express');
const router = express.Router();
const gamesController = require('../controllers/games.controller');

router.get('/search', gamesController.searchGames);
router.get('/:id', gamesController.getGameById);

module.exports = router;