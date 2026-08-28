/**
 * Utilidad para transformar errores de peticiones HTTP (Axios / Fetch) y excepciones
 * en mensajes amigables e intuitivos para el usuario final.
 */

export const getFriendlyErrorMessage = (error, defaultMessage = "Ocurrió un error inesperado. Intenta de nuevo.") => {
  if (!error) return defaultMessage;

  // Si se pasa un string directo
  if (typeof error === 'string') {
    return cleanRawErrorMessage(error);
  }

  // Manejo de respuesta HTTP de Axios
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    // Si el backend envió un mensaje explícito legible
    if (data && data.message && typeof data.message === 'string' && !isRawTechnicalError(data.message)) {
      return data.message;
    }

    // Traducción por códigos de estado HTTP
    switch (status) {
      case 400:
        return "La solicitud no pudo procesarse. Verifica la información ingresada.";
      case 401:
        return "Credenciales incorrectas o sesión expirada. Inicia sesión nuevamente.";
      case 403:
        return "No tienes permisos para realizar esta acción.";
      case 404:
        return "El recurso o elemento solicitado no existe o fue movido.";
      case 409:
        return "El registro ya existe o entra en conflicto con un dato actual.";
      case 422:
        return "Los datos enviados contienen un formato no válido.";
      case 429:
        return "Demasiadas solicitudes en poco tiempo. Espera unos momentos.";
      case 500:
      case 502:
      case 503:
      case 504:
        return "El servidor tuvo un inconveniente temporal. Inténtalo más tarde.";
      default:
        return defaultMessage;
    }
  }

  // Error de conexión o red (ej. servidor caído, CORS, offline)
  if (error.code === "ERR_NETWORK" || error.message?.includes("Network Error")) {
    return "No se pudo conectar con el servidor. Revisa tu conexión a internet.";
  }

  if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
    return "El servidor tardó demasiado en responder. Inténtalo de nuevo.";
  }

  // Si hay un mensaje explicativo en la propiedad .message
  if (error.message && typeof error.message === 'string' && !isRawTechnicalError(error.message)) {
    return error.message;
  }

  return defaultMessage;
};

/**
 * Determina si una cadena es un error técnico crudo (ej. "Request failed with status code 403", "AxiosError", etc.)
 */
const isRawTechnicalError = (msg) => {
  if (!msg) return false;
  const rawPatterns = [
    /request failed with status code/i,
    /axioserror/i,
    /network error/i,
    /syntaxerror/i,
    /typeerror/i,
    /cannot read property/i,
    /sql syntax/i
  ];
  return rawPatterns.some(pattern => pattern.test(msg));
};

const cleanRawErrorMessage = (msg) => {
  if (isRawTechnicalError(msg)) {
    if (msg.includes("403")) return "No tienes permisos para realizar esta acción.";
    if (msg.includes("401")) return "Credenciales incorrectas o sesión expirada.";
    if (msg.includes("400")) return "Información inválida o incompleta.";
    if (msg.includes("404")) return "El recurso no fue encontrado.";
    if (msg.includes("500")) return "Error interno en el servidor.";
    return "Ocurrió un error al procesar la solicitud.";
  }
  return msg;
};
