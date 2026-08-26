/**
 * Servicio de Cálculo Determinista de Precios (PriceService)
 * Garantiza que para el mismo id_juego (IGDB ID), el precio calculado sea constante y predecible.
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
   * Adjunta el precio determinista a un objeto de juego individual.
   * @param {Object} game - Objeto de juego
   * @returns {Object} Objeto enriquecido con propiedades de precio
   */
  attachPrice(game) {
    if (!game) return game;
    const basePrice = this.calculateBasePrice(game.id || game.id_juego);
    return {
      ...game,
      price: basePrice.toFixed(2),
      precio: basePrice
    };
  }

  /**
   * Adjunta el precio determinista a un arreglo de juegos.
   * @param {Array} games - Lista de juegos
   * @returns {Array} Lista de juegos con precios constantes
   */
  attachPrices(games) {
    if (!Array.isArray(games)) return [];
    return games.map((g) => this.attachPrice(g));
  }
}

module.exports = new PriceService();
