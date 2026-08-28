const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authLimiter } = require('../middleware/rateLimiterMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validatorMiddleware');

// Aplicar Rate Limiting a todas las rutas de autenticación
router.use(authLimiter);

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-code', authController.verifyCode);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
