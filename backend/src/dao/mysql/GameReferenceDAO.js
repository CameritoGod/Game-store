const IGameReferenceDAO = require('../../interfaces/IGameReferenceDAO');
const pool = require('../../config/db');

/**
 * Data Access Object para sincronización de metadatos base de juegos (título, carátula) en MySQL.
 */
class GameReferenceDAO extends IGameReferenceDAO {
  /**
   * Inserta o actualiza el nombre e imagen de un juego en la tabla de referencia.
   */
  async upsert(id_juego, nombre, imagen_url) {
    const [result] = await pool.query(
      `INSERT INTO juegos_referencia (id_juego, nombre, imagen_url)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         nombre = VALUES(nombre),
         imagen_url = VALUES(imagen_url)`,
      [id_juego, nombre, imagen_url || null]
    );
    return result;
  }

  /**
   * Busca los metadatos de un juego por su identificador único.
   */
  async findById(id_juego) {
    const [rows] = await pool.query(
      `SELECT * FROM juegos_referencia WHERE id_juego = ?`,
      [id_juego]
    );
    return rows[0] || null;
  }

  /**
   * Retorna todas las referencias de juegos ordenadas alfabéticamente.
   */
  async findAll() {
    const [rows] = await pool.query(
      `SELECT * FROM juegos_referencia ORDER BY nombre ASC`
    );
    return rows;
  }
}

module.exports = GameReferenceDAO;
