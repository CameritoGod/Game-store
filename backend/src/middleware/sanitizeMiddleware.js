/**
 * Sanitiza valores de texto eliminando etiquetas XSS peligrosas y espacios extra.
 */
const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    let clean = value.trim();
    // Eliminar script tags y handlers JS peligrosos
    clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    clean = clean.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    clean = clean.replace(/javascript\s*:/gi, '');
    // Reemplazar corchetes angulares de HTML si no son parte de texto simple
    clean = clean.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return clean;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value !== null && typeof value === 'object') {
    const sanitizedObj = {};
    for (const key of Object.keys(value)) {
      sanitizedObj[key] = sanitizeValue(value[key]);
    }
    return sanitizedObj;
  }

  return value;
};

/**
 * Middleware express que desinfecta req.body, req.query y req.params
 */
const sanitizeMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }
  next();
};

module.exports = sanitizeMiddleware;
