const ICatalogDAO = require('../../interfaces/ICatalogDAO');
const pool = require('../../config/db');

class CatalogDAO extends ICatalogDAO {
  async findAll() {
    const [rows] = await pool.query(
      `SELECT c.id_juego, c.precio_actual, c.activo, c.actualizado_en,
              j.nombre, j.imagen_url
       FROM CATALOGO_JUEGOS c
       JOIN JUEGOS_REFERENCIA j ON c.id_juego = j.id_juego
       ORDER BY j.nombre ASC`
    );
    return rows;
  }

  async findById(id_juego) {
    const [rows] = await pool.query(
      `SELECT c.id_juego, c.precio_actual, c.activo, c.actualizado_en,
              j.nombre, j.imagen_url
       FROM CATALOGO_JUEGOS c
       JOIN JUEGOS_REFERENCIA j ON c.id_juego = j.id_juego
       WHERE c.id_juego = ?`,
      [id_juego]
    );
    return rows[0] || null;
  }

  async setPrice(id_juego, precio_actual, activo = true) {
    const [result] = await pool.query(
      `INSERT INTO CATALOGO_JUEGOS (id_juego, precio_actual, activo)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         precio_actual = VALUES(precio_actual),
         activo = VALUES(activo)`,
      [id_juego, precio_actual, activo]
    );
    return result;
  }

  async toggleActive(id_juego, activo) {
    const [result] = await pool.query(
      `UPDATE CATALOGO_JUEGOS
       SET activo = ?
       WHERE id_juego = ?`,
      [activo, id_juego]
    );
    return result.affectedRows > 0;
  }
}

module.exports = CatalogDAO;
