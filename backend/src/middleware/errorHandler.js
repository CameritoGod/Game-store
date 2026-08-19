module.exports = (err, req, res, next) => {
  console.error('❌ Error:', err.message);
  
  // Errores de IGDB
  if (err.response) {
    return res.status(err.response.status || 500).json({
      error: 'Error al comunicarse con IGDB',
      details: err.response.data
    });
  }
  
  // Errores genéricos
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
};