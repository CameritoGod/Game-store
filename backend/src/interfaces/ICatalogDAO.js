/**
 * Contrato Interface base para ICatalogDAO (CatalogoJuegos).
 */
class ICatalogDAO {
  async findAll() {
    throw new Error("Method findAll() not implemented");
  }

  async findById(id_juego) {
    throw new Error("Method findById() not implemented");
  }

  async setPrice(id_juego, precio_actual, activo = true) {
    throw new Error("Method setPrice() not implemented");
  }

  async toggleActive(id_juego, activo) {
    throw new Error("Method toggleActive() not implemented");
  }
}

module.exports = ICatalogDAO;
