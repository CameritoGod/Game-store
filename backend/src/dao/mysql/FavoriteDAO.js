const IFavoriteDAO = require('../../interfaces/IFavoriteDAO');
const pool = require('../../config/db');
const GameReferenceDAO = require('./GameReferenceDAO');

class FavoriteDAO extends IFavoriteDAO {
  constructor() {
    super();
    this.gameRefDAO = new GameReferenceDAO();
  }

  async addFavorite(id_usuario, gameData) {
    const { id_juego, nombre, imagen_url } = gameData;
    // 1. Asegurar existencia en JUEGOS_REFERENCIA
    await this.gameRefDAO.upsert(id_juego, nombre || `Juego #${id_juego}`, imagen_url);

    // 2. Insertar en FAVORITOS
    const [result] = await pool.query(
      `INSERT IGNORE INTO FAVORITOS (id_usuario, id_juego)
       VALUES (?, ?)`,
      [id_usuario, id_juego]
    );

    return result;
  }

  async removeFavorite(id_usuario, id_juego) {
    const [result] = await pool.query(
      `DELETE FROM FAVORITOS
       WHERE id_usuario = ? AND id_juego = ?`,
      [id_usuario, id_juego]
    );
    return result.affectedRows > 0;
  }

  async getUserFavorites(id_usuario) {
    const [rows] = await pool.query(
      `SELECT f.id_usuario, f.id_juego, f.fecha_agregado,
              j.nombre, j.imagen_url,
              COALESCE(c.precio_actual, 0.00) AS precio
       FROM FAVORITOS f
       JOIN JUEGOS_REFERENCIA j ON f.id_juego = j.id_juego
       LEFT JOIN CATALOGO_JUEGOS c ON f.id_juego = c.id_juego
       WHERE f.id_usuario = ?
       ORDER BY f.fecha_agregado DESC`,
      [id_usuario]
    );
    return rows;
  }

  async isFavorite(id_usuario, id_juego) {
    const [rows] = await pool.query(
      `SELECT 1 FROM FAVORITOS WHERE id_usuario = ? AND id_juego = ?`,
      [id_usuario, id_juego]
    );
    return rows.length > 0;
  }
}

module.exports = FavoriteDAO;
