/**
 * Contrato Interface base para IGameReferenceDAO (JuegosReferencia).
 */
class IGameReferenceDAO {
  async upsert(id_juego, nombre, imagen_url) {
    throw new Error("Method upsert() not implemented");
  }

  async findById(id_juego) {
    throw new Error("Method findById() not implemented");
  }

  async findAll() {
    throw new Error("Method findAll() not implemented");
  }
}

module.exports = IGameReferenceDAO;
