/**
 * Contrato Interface base para ILibraryDAO.
 */
class ILibraryDAO {
  async getUserLibrary(id_usuario) {
    throw new Error("Method getUserLibrary() not implemented");
  }

  async ownsGame(id_usuario, id_juego) {
    throw new Error("Method ownsGame() not implemented");
  }

  async addEntry(id_usuario, id_juego, id_compra) {
    throw new Error("Method addEntry() not implemented");
  }
}

module.exports = ILibraryDAO;
