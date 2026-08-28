const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/authMiddleware');

// Aplicar authMiddleware a todas las rutas de usuario
router.use(authMiddleware);

// Rutas especificas de Perfil y Avatar
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/avatar', userController.updateAvatar);

// Rutas parametrizadas por ID
router.put('/:id', userController.updateProfile);

// Favoritos
router.get('/favorites', userController.getFavorites);
router.post('/favorites', userController.addFavorite);
router.delete('/favorites/:gameId', userController.deleteFavorite);

// Biblioteca
router.get('/library', userController.getLibrary);

// Compras & Checkout
router.get('/purchases', userController.getPurchases);
router.post('/purchases', userController.checkout);
router.post('/checkout', userController.checkout);

module.exports = router;
