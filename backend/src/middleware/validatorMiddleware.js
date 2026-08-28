/**
 * Middlewares de Validación de Esquemas y Lista Blanca (Whitelisting)
 * Evita la asignación masiva (Mass Assignment) y valida formatos de entrada.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Lista blanca para filtrado de req.body (elimina campos no permitidos)
const filterWhitelistedFields = (body, allowedFields) => {
  const filtered = {};
  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      filtered[field] = body[field];
    }
  }
  return filtered;
};

exports.validateRegister = (req, res, next) => {
  req.body = filterWhitelistedFields(req.body, ['nombre', 'nickname', 'email', 'password', 'rol']);
  const { nombre, nickname, email, password } = req.body;

  if (!nombre || !nickname || !email || !password) {
    return res.status(400).json({ message: 'Todos los campos obligatorios deben ser completados.' });
  }

  if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ message: 'El correo electrónico no tiene un formato válido.' });
  }

  if (typeof password !== 'string' || password.trim().length < 4) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 4 caracteres.' });
  }

  if (typeof nickname !== 'string' || nickname.trim().length < 2) {
    return res.status(400).json({ message: 'El nickname debe tener al menos 2 caracteres.' });
  }

  next();
};

exports.validateLogin = (req, res, next) => {
  req.body = filterWhitelistedFields(req.body, ['email', 'password']);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Por favor proporciona correo y contraseña.' });
  }

  if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ message: 'El formato de correo no es válido.' });
  }

  next();
};

exports.validateForgotPassword = (req, res, next) => {
  req.body = filterWhitelistedFields(req.body, ['email']);
  const { email } = req.body;

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ message: 'Ingresa un correo electrónico válido.' });
  }

  next();
};

exports.validateVerifyCode = (req, res, next) => {
  req.body = filterWhitelistedFields(req.body, ['email', 'code']);
  const { email, code } = req.body;

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ message: 'Ingresa un correo electrónico válido.' });
  }

  if (!code || typeof code !== 'string' || code.trim().length < 4) {
    return res.status(400).json({ message: 'Ingresa el código de verificación válido.' });
  }

  next();
};

exports.validateResetPassword = (req, res, next) => {
  req.body = filterWhitelistedFields(req.body, ['email', 'code', 'password']);
  const { email, code, password } = req.body;

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ message: 'Ingresa un correo electrónico válido.' });
  }

  if (!code || typeof code !== 'string' || code.trim().length < 4) {
    return res.status(400).json({ message: 'Se requiere el código de verificación.' });
  }

  if (!password || typeof password !== 'string' || password.trim().length < 4) {
    return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 4 caracteres.' });
  }

  next();
};

exports.validateAvatarUpdate = (req, res, next) => {
  req.body = filterWhitelistedFields(req.body, ['avatar_url']);
  const { avatar_url } = req.body;

  if (!avatar_url || typeof avatar_url !== 'string' || avatar_url.trim() === '') {
    return res.status(400).json({ message: 'Se requiere una URL o identificador válido para el avatar.' });
  }

  // Prevenir inyecciones en URLs o esquemas peligrosos
  const cleanUrl = avatar_url.trim();
  if (cleanUrl.startsWith('javascript:') || cleanUrl.startsWith('data:text/html')) {
    return res.status(400).json({ message: 'URL de avatar no permitida por razones de seguridad.' });
  }

  next();
};

exports.validateProfileUpdate = (req, res, next) => {
  req.body = filterWhitelistedFields(req.body, ['nombre', 'name', 'nickname', 'password']);
  const { password } = req.body;

  if (password && typeof password === 'string' && password.trim() !== '') {
    if (password.trim().length < 4) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 4 caracteres.' });
    }
  }

  next();
};

exports.validateCatalogPrice = (req, res, next) => {
  req.body = filterWhitelistedFields(req.body, ['id_juego', 'nombre', 'imagen_url', 'precio_actual', 'activo']);
  const { id_juego, precio_actual } = req.body;

  if (!id_juego || isNaN(Number(id_juego))) {
    return res.status(400).json({ message: 'Identificador de juego inválido.' });
  }

  if (precio_actual === undefined || isNaN(Number(precio_actual)) || Number(precio_actual) < 0) {
    return res.status(400).json({ message: 'El precio debe ser un número válido igual o mayor a 0.' });
  }

  next();
};

exports.validateDiscount = (req, res, next) => {
  req.body = filterWhitelistedFields(req.body, ['nombre', 'descripcion', 'porcentaje', 'fecha_inicio', 'fecha_fin', 'games', 'gameIds']);
  const { nombre, porcentaje, fecha_inicio, fecha_fin } = req.body;

  if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
    return res.status(400).json({ message: 'El nombre de la campaña es obligatorio.' });
  }

  const pct = parseFloat(porcentaje);
  if (isNaN(pct) || pct <= 0 || pct > 100) {
    return res.status(400).json({ message: 'El porcentaje debe ser un valor entre 1 y 100.' });
  }

  if (!fecha_inicio || !fecha_fin) {
    return res.status(400).json({ message: 'Las fechas de inicio y fin son obligatorias.' });
  }

  const start = new Date(fecha_inicio);
  const end = new Date(fecha_fin);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    return res.status(400).json({ message: 'La fecha de finalización debe ser posterior o igual a la fecha de inicio.' });
  }

  next();
};
