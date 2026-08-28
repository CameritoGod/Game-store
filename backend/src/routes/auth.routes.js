const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authLimiter } = require('../middleware/rateLimiterMiddleware');
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateVerifyCode,
  validateResetPassword
} = require('../middleware/validatorMiddleware');

// Aplicar Rate Limiting a todas las rutas de autenticación
router.use(authLimiter);

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/verify-code', validateVerifyCode, authController.verifyCode);
router.post('/reset-password', validateResetPassword, authController.resetPassword);

module.exports = router;
