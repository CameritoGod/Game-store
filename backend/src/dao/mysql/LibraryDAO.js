const ILibraryDAO = require('../../interfaces/ILibraryDAO');
const pool = require('../../config/db');

/**
 * Data Access Object para gestión de licencias y juegos en la biblioteca del usuario.
 */
class LibraryDAO extends ILibraryDAO {
  /**
   * Consulta los juegos adquiridos por un usuario con metadatos y fecha de adquisición.
   */
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

  /**
   * Verifica si el usuario posee la licencia de un juego en su biblioteca.
   */
  async ownsGame(id_usuario, id_juego) {
    const [rows] = await pool.query(
      `SELECT 1 FROM BIBLIOTECA WHERE id_usuario = ? AND id_juego = ?`,
      [id_usuario, id_juego]
    );
    return rows.length > 0;
  }

  /**
   * Retorna una lista con los IDs numéricos de los juegos adquiridos por el usuario.
   */
  async getUserLibraryGameIds(id_usuario) {
    const [rows] = await pool.query(
      `SELECT id_juego FROM BIBLIOTECA WHERE id_usuario = ?`,
      [id_usuario]
    );
    return rows.map(r => Number(r.id_juego));
  }

  /**
   * Registra una licencia en la biblioteca de un usuario asociada opcionalmente a una compra.
   */
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
