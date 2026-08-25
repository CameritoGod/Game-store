const ILibraryDAO = require('../../interfaces/ILibraryDAO');
const pool = require('../../config/db');

class LibraryDAO extends ILibraryDAO {
  async getUserLibrary(id_usuario) {
    const [rows] = await pool.query(
      `SELECT b.id_usuario, b.id_juego, b.id_compra, b.adquirido_en,
              j.nombre, j.imagen_url
       FROM BIBLIOTECA b
       JOIN JUEGOS_REFERENCIA j ON b.id_juego = j.id_juego
       WHERE b.id_usuario = ?
       ORDER BY b.adquirido_en DESC`,
      [id_usuario]
    );
    return rows;
  }

  async ownsGame(id_usuario, id_juego) {
    const [rows] = await pool.query(
      `SELECT 1 FROM BIBLIOTECA WHERE id_usuario = ? AND id_juego = ?`,
      [id_usuario, id_juego]
    );
    return rows.length > 0;
  }

  async addEntry(id_usuario, id_juego, id_compra = null) {
    const [result] = await pool.query(
      `INSERT IGNORE INTO BIBLIOTECA (id_usuario, id_juego, id_compra)
       VALUES (?, ?, ?)`,
      [id_usuario, id_juego, id_compra]
    );
    return result;
  }
}

module.exports = LibraryDAO;
