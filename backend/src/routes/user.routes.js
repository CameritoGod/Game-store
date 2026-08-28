const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { checkoutLimiter } = require('../middleware/rateLimiterMiddleware');
const { validateAvatarUpdate, validateProfileUpdate } = require('../middleware/validatorMiddleware');

// Aplicar authMiddleware a todas las rutas de usuario
router.use(authMiddleware);

// Rutas especificas de Perfil y Avatar
router.get('/profile', userController.getProfile);
router.put('/profile', validateProfileUpdate, userController.updateProfile);
router.put('/avatar', validateAvatarUpdate, userController.updateAvatar);

// Rutas parametrizadas por ID
router.put('/:id', validateProfileUpdate, userController.updateProfile);

// Favoritos
router.get('/favorites', userController.getFavorites);
router.post('/favorites', userController.addFavorite);
router.delete('/favorites/:gameId', userController.deleteFavorite);

// Biblioteca
router.get('/library', userController.getLibrary);

// Compras & Checkout (Protegidos con checkoutLimiter)
router.get('/purchases', userController.getPurchases);
router.post('/purchases', checkoutLimiter, userController.checkout);
router.post('/checkout', checkoutLimiter, userController.checkout);

module.exports = router;
