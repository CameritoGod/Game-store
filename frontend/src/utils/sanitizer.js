/**
 * Utilidades de sanitización y escape de caracteres para prevenir ataques XSS en Frontend.
 */

/**
 * Escapa caracteres HTML especiales para evitar inyección en renderizado directo.
 */
export const escapeHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Recorta espacios y limpia etiquetas peligrosas antes de enviar datos al servidor.
 */
export const sanitizeInput = (str) => {
  if (typeof str !== 'string') return str;
  let clean = str.trim();
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  clean = clean.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  clean = clean.replace(/javascript\s*:/gi, '');
  return clean;
};
