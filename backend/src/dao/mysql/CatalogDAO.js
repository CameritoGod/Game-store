const ICatalogDAO = require('../../interfaces/ICatalogDAO');
const pool = require('../../config/db');

/**
 * Data Access Object para gestión de precios comerciales y visibilidad en catálogo.
 */
class CatalogDAO extends ICatalogDAO {
  /**
   * Consulta todos los juegos del catálogo comercial junto a sus metadatos de referencia.
   */
  async findAll() {
    const [rows] = await pool.query(
      `SELECT c.id_juego, c.precio_actual, c.activo, c.actualizado_en,
              j.nombre, j.imagen_url
       FROM catalogo_juegos c
       JOIN juegos_referencia j ON c.id_juego = j.id_juego
       ORDER BY j.nombre ASC`
    );
    return rows;
  }

  /**
   * Busca un juego en el catálogo comercial por su identificador.
   */
  async findById(id_juego) {
    const [rows] = await pool.query(
      `SELECT c.id_juego, c.precio_actual, c.activo, c.actualizado_en,
              j.nombre, j.imagen_url
       FROM catalogo_juegos c
       JOIN juegos_referencia j ON c.id_juego = j.id_juego
       WHERE c.id_juego = ?`,
      [id_juego]
    );
    return rows[0] || null;
  }

  /**
   * Inserta o actualiza el precio y estado de activación de un juego.
   */
  async setPrice(id_juego, precio_actual, activo = true) {
    const [result] = await pool.query(
      `INSERT INTO catalogo_juegos (id_juego, precio_actual, activo)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         precio_actual = VALUES(precio_actual),
         activo = VALUES(activo)`,
      [id_juego, precio_actual, activo]
    );
    return result;
  }

  /**
   * Alterna el estado de activación/visibilidad de un juego en el catálogo.
   */
  async toggleActive(id_juego, activo) {
    const [result] = await pool.query(
      `UPDATE catalogo_juegos
       SET activo = ?
       WHERE id_juego = ?`,
      [activo, id_juego]
    );
    return result.affectedRows > 0;
  }
}

module.exports = CatalogDAO;
