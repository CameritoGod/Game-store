const jwt = require('jsonwebtoken');

/**
 * Middleware Opcional de Autenticación.
 * Si la petición incluye un token Bearer válido en los encabezados, adjunta el usuario a req.user.
 * Si no se proporciona token o es inválido, permite continuar la ejecución con req.user = null.
 */
const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'supersecret_jwt_key_gamestore_2026'
      );
      req.user = decoded; // { id_usuario, rol, nickname, email }
    } catch (e) {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};

module.exports = optionalAuthMiddleware;
