/**
 * Contrato Interface base para IDiscountDAO.
 */
class IDiscountDAO {
  async createDiscount(discountData, gameIds) {
    throw new Error("Method createDiscount() not implemented");
  }

  async getAllDiscounts() {
    throw new Error("Method getAllDiscounts() not implemented");
  }

  async getActiveDiscountForGame(id_juego) {
    throw new Error("Method getActiveDiscountForGame() not implemented");
  }

  async deleteDiscount(id_descuento) {
    throw new Error("Method deleteDiscount() not implemented");
  }
}

module.exports = IDiscountDAO;
