const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const hpp = require('hpp');
require('dotenv').config();

const sanitizeMiddleware = require('./src/middleware/sanitizeMiddleware');
const { globalLimiter } = require('./src/middleware/rateLimiterMiddleware');
const { startKeepAlive } = require('./src/utils/keepAlive');

const gamesRoutes = require('./src/routes/games.routes');
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const adminRoutes = require('./src/routes/admin.routes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración defensiva de cabeceras HTTP con Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  xssFilter: true,
  noSniff: true,
  hidePoweredBy: true
}));

// Protección contra Polución de Parámetros HTTP (HPP)
app.use(hpp());

// Configuración dinámica de CORS para desarrollo y producción
// Normalizar orígenes desde variables de entorno
const rawOrigins = process.env.FRONTEND_URL || process.env.CLIENT_URL || '';
const configuredOrigins = rawOrigins
  ? rawOrigins.split(',').map(url => url.trim().replace(/\/$/, '')).filter(Boolean)
  : [];

const defaultDevOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

// Combinar siempre desarrollo con los orígenes configurados
const allowedOrigins = [...defaultDevOrigins, ...configuredOrigins];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (Postman, curl, health checks, cron jobs)
    if (!origin) return callback(null, true);

    // Permitir si coincide exactamente con la lista
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }

    // Permitir cualquier previsualización de Vercel
    if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    // Rechazar sin disparar una excepción no controlada
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Client-ID'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware global de desinfección de inputs (XSS & Trim)
app.use(sanitizeMiddleware);

// Limitador global de peticiones por IP
app.use('/api/', globalLimiter);

// Rutas de la API
app.use('/api/games', gamesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// Endpoint de verificación de salud del servidor
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Manejador centralizado de errores
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  startKeepAlive();
});