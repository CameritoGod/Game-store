const https = require('https');
const http = require('http');

/**
 * Servicio Keep-Alive ultra liviano para evitar el Cold Start en Render y plataformas PaaS gratuitas.
 * Realiza un ping periódico cada 14 minutos al endpoint /api/health usando módulos nativos de Node.js.
 */
function startKeepAlive() {
  // Render provee automáticamente RENDER_EXTERNAL_URL (ej. https://mi-backend.onrender.com)
  const targetUrl = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL || process.env.SERVER_URL;

  // Si no hay URL pública configurada (ej. entorno de desarrollo local), no ejecuta el ciclo
  if (!targetUrl || targetUrl.includes('localhost') || targetUrl.includes('127.0.0.1')) {
    return;
  }

  const cleanUrl = targetUrl.replace(/\/$/, '');
  const healthEndpoint = `${cleanUrl}/api/health`;
  const intervalMs = 14 * 60 * 1000; // 14 minutos (Render suspende a los 15 min)

  const client = healthEndpoint.startsWith('https') ? https : http;

  const ping = () => {
    client.get(healthEndpoint, (res) => {
      res.on('data', () => {}); // Consumir stream para liberar memoria
    }).on('error', () => {
      // Fallo de red ignorado silenciosamente para no interrumpir el servidor
    });
  };

  // Iniciar temporizador no bloqueante
  const timer = setInterval(ping, intervalMs);
  if (timer.unref) {
    timer.unref(); // Permite que Node.js termine normalmente si se requiere cerrar el proceso
  }
}

module.exports = { startKeepAlive };
