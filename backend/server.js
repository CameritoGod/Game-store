const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
require('dotenv').config();

const gamesRoutes = require('./src/routes/games.routes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : '*';

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Client-ID'],
  credentials: true
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging básico
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// Rutas
app.use('/api/games', gamesRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Manejador de errores
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📋 Endpoints disponibles:`);
  console.log(`   GET  /api/games/search?q=zelda&limit=20`);
  console.log(`   GET  /api/games/:id`);
  console.log(`   GET  /api/health`);
});