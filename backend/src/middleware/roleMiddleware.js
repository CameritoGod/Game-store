const roleMiddleware = (requiredRole = 'admin') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    if (req.user.rol !== requiredRole && req.user.id_rol !== 1) {
      return res.status(403).json({ message: 'Acceso denegado. Requiere privilegios de administrador.' });
    }

    next();
  };
};

module.exports = roleMiddleware;
