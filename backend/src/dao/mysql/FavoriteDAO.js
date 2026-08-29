const IFavoriteDAO = require('../../interfaces/IFavoriteDAO');
const pool = require('../../config/db');
const GameReferenceDAO = require('./GameReferenceDAO');

/**
 * Data Access Object para gestión de la lista de juegos favoritos del usuario.
 */
class FavoriteDAO extends IFavoriteDAO {
  constructor() {
    super();
    this.gameRefDAO = new GameReferenceDAO();
  }

  /**
   * Guarda o actualiza metadatos del juego y lo añade a los favoritos del usuario.
   */
  async addFavorite(id_usuario, gameData) {
    const { id_juego, nombre, imagen_url } = gameData;
    await this.gameRefDAO.upsert(id_juego, nombre || `Juego #${id_juego}`, imagen_url);

    const [result] = await pool.query(
      `INSERT IGNORE INTO favoritos (id_usuario, id_juego)
       VALUES (?, ?)`,
      [id_usuario, id_juego]
    );

    return result;
  }

  /**
   * Elimina un juego de la lista de favoritos del usuario.
   */
  async removeFavorite(id_usuario, id_juego) {
    const [result] = await pool.query(
      `DELETE FROM favoritos
       WHERE id_usuario = ? AND id_juego = ?`,
      [id_usuario, id_juego]
    );
    return result.affectedRows > 0;
  }

  /**
   * Consulta todos los juegos favoritos de un usuario con metadatos y precio vigente.
   */
  async getUserFavorites(id_usuario) {
    const [rows] = await pool.query(
      `SELECT f.id_usuario, f.id_juego, f.fecha_agregado,
              j.nombre, j.imagen_url,
              COALESCE(c.precio_actual, 0.00) AS precio
       FROM favoritos f
       JOIN juegos_referencia j ON f.id_juego = j.id_juego
       LEFT JOIN catalogo_juegos c ON f.id_juego = c.id_juego
       WHERE f.id_usuario = ?
       ORDER BY f.fecha_agregado DESC`,
      [id_usuario]
    );
    return rows;
  }

  /**
   * Comprueba si un juego ya pertenece a los favoritos del usuario.
   */
  async isFavorite(id_usuario, id_juego) {
    const [rows] = await pool.query(
      `SELECT 1 FROM favoritos WHERE id_usuario = ? AND id_juego = ?`,
      [id_usuario, id_juego]
    );
    return rows.length > 0;
  }
}

module.exports = FavoriteDAO;
