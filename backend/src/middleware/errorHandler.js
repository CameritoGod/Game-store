module.exports = (err, req, res, next) => {
  // Registrar el error detallado en logs del servidor (invisible para clientes)
  console.error('❌ [SERVER ERROR]:', err);

  // Errores de integración externa IGDB
  if (err.response) {
    return res.status(err.response.status || 500).json({
      message: 'Error al comunicarse con el proveedor de juegos.'
    });
  }

  // Errores de sintaxis JSON en payloads
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      message: 'El formato de la solicitud no es un JSON válido.'
    });
  }

  // Respuesta genérica de seguridad sin filtrar stack traces ni detalles internos de BD
  const statusCode = err.statusCode || err.status || 500;
  const message = (statusCode < 500 && err.message)
    ? err.message
    : 'Ocurrió un inconveniente interno en el servidor. Por favor intenta más tarde.';

  res.status(statusCode).json({
    message
  });
};