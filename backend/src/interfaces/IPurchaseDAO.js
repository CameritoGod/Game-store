/**
 * Contrato Interface base para IPurchaseDAO.
 */
class IPurchaseDAO {
  async processCheckout(id_usuario, items) {
    throw new Error("Method processCheckout() not implemented");
  }

  async getUserPurchases(id_usuario) {
    throw new Error("Method getUserPurchases() not implemented");
  }

  async getAllPurchases() {
    throw new Error("Method getAllPurchases() not implemented");
  }

  async getAdminMetrics() {
    throw new Error("Method getAdminMetrics() not implemented");
  }
}

module.exports = IPurchaseDAO;
