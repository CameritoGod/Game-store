/**
 * Servicio de Cálculo Determinista de Precios y Aplicación de Ofertas (PriceService)
 * Garantiza que para el mismo id_juego (IGDB ID), el precio base sea constante y predecible,
 * y aplica dinámicamente las promociones activas si existen en la base de datos.
 */
class PriceService {
  /**
   * Calcula un precio determinista fijo para un ID numérico de juego.
   * @param {number|string} gameId - ID del juego
   * @returns {number} Precio numérico fijo (ej. 29.99)
   */
  calculateBasePrice(gameId) {
    const id = Math.abs(parseInt(gameId, 10)) || 1;

    // Escala de precios estándar de la industria
    const priceTiers = [
      9.99,  14.99, 19.99, 24.99, 29.99,
      34.99, 39.99, 44.99, 49.99, 59.99, 69.99
    ];

    // Algoritmo de dispersión determinista (Knuth Multiplicative Hash)
    const hash = Math.abs((id * 2654435761) ^ (id >> 13));
    const index = hash % priceTiers.length;

    return priceTiers[index];
  }

  /**
   * Adjunta el precio determinista y calcula la oferta activa si existe.
   * @param {Object} game - Objeto de juego
   * @param {Map<number, Object>} activeDiscountsMap - Mapa opcional de ofertas activas por id_juego
   * @returns {Object} Objeto enriquecido con propiedades de precio u oferta
   */
  attachPrice(game, activeDiscountsMap = null) {
    if (!game) return game;

    const gameId = Number(game.id || game.id_juego);
    const basePrice = this.calculateBasePrice(gameId);

    // Verificar si el juego tiene una oferta activa
    const activeDiscount = activeDiscountsMap ? activeDiscountsMap.get(gameId) : null;

    if (activeDiscount && activeDiscount.porcentaje > 0) {
      const percentage = activeDiscount.porcentaje;
      const finalPrice = parseFloat((basePrice * (1 - percentage / 100)).toFixed(2));

      return {
        ...game,
        price: finalPrice.toFixed(2),
        precio: finalPrice,
        oldPrice: `$${basePrice.toFixed(2)}`,
        precio_original: basePrice,
        discount: `-${percentage}%`,
        porcentaje_descuento: percentage,
        descuento_nombre: activeDiscount.nombre,
        hasDiscount: true
      };
    }

    return {
      ...game,
      price: basePrice.toFixed(2),
      precio: basePrice,
      oldPrice: `$${basePrice.toFixed(2)}`,
      precio_original: basePrice,
      hasDiscount: false
    };
  }

  /**
   * Adjunta los precios y ofertas a un arreglo de juegos.
   * @param {Array} games - Lista de juegos
   * @param {Map<number, Object>} activeDiscountsMap - Mapa opcional de ofertas activas
   * @returns {Array} Lista de juegos con precios calculados
   */
  attachPrices(games, activeDiscountsMap = null) {
    if (!Array.isArray(games)) return [];
    return games.map((g) => this.attachPrice(g, activeDiscountsMap));
  }
}

module.exports = new PriceService();
