const IGameReferenceDAO = require('../../interfaces/IGameReferenceDAO');
const pool = require('../../config/db');

class GameReferenceDAO extends IGameReferenceDAO {
  async upsert(id_juego, nombre, imagen_url) {
    const [result] = await pool.query(
      `INSERT INTO JUEGOS_REFERENCIA (id_juego, nombre, imagen_url)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         nombre = VALUES(nombre),
         imagen_url = VALUES(imagen_url)`,
      [id_juego, nombre, imagen_url || null]
    );
    return result;
  }

  async findById(id_juego) {
    const [rows] = await pool.query(
      `SELECT * FROM JUEGOS_REFERENCIA WHERE id_juego = ?`,
      [id_juego]
    );
    return rows[0] || null;
  }

  async findAll() {
    const [rows] = await pool.query(
      `SELECT * FROM JUEGOS_REFERENCIA ORDER BY nombre ASC`
    );
    return rows;
  }
}

module.exports = GameReferenceDAO;
