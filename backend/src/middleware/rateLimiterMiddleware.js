const rateLimit = require('express-rate-limit');

/**
 * Limitador estricto para endpoints de autenticación (Login, Registro, Recuperación de clave)
 * Previene ataques de fuerza bruta y credential stuffing.
 * Máximo 10 intentos por IP cada 15 minutos.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Demasiados intentos de autenticación desde esta IP. Por favor intenta de nuevo en 15 minutos.'
  }
});

/**
 * Limitador para operaciones sensibles de transacciones y compras
 * Máximo 10 peticiones por usuario/IP cada 15 minutos.
 */
const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Has alcanzado el límite de intentos de compra por sesión. Espera unos minutos.'
  }
});

/**
 * Limitador de ráfagas para búsquedas y autocompletado
 * Máximo 100 peticiones por minuto para prevenir scraping desmedido o flooding.
 */
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Demasiadas solicitudes de búsqueda en poco tiempo. Por favor desacelera.'
  }
});

/**
 * Limitador global para todas las rutas API
 * Máximo 300 peticiones por IP cada 15 minutos.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Límite general de peticiones alcanzado. Por favor intenta más tarde.'
  }
});

module.exports = {
  authLimiter,
  checkoutLimiter,
  searchLimiter,
  globalLimiter
};
