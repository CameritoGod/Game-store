/**
 * Contrato Interface base para IFavoriteDAO.
 */
class IFavoriteDAO {
  async addFavorite(id_usuario, id_juego) {
    throw new Error("Method addFavorite() not implemented");
  }

  async removeFavorite(id_usuario, id_juego) {
    throw new Error("Method removeFavorite() not implemented");
  }

  async getUserFavorites(id_usuario) {
    throw new Error("Method getUserFavorites() not implemented");
  }

  async isFavorite(id_usuario, id_juego) {
    throw new Error("Method isFavorite() not implemented");
  }
}

module.exports = IFavoriteDAO;
