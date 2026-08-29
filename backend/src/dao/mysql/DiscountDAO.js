const IDiscountDAO = require('../../interfaces/IDiscountDAO');
const pool = require('../../config/db');

class DiscountDAO extends IDiscountDAO {
  /**
   * Crea una nueva campaña de descuento e inserta las relaciones con juegos en una transacción.
   */
  async createDiscount(discountData, gameIds = []) {
    const { nombre, descripcion, porcentaje, fecha_inicio, fecha_fin, creado_por } = discountData;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        `INSERT INTO descuentos (nombre, descripcion, porcentaje, fecha_inicio, fecha_fin, creado_por)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [nombre, descripcion || null, porcentaje, fecha_inicio, fecha_fin, creado_por]
      );
      const id_descuento = result.insertId;

      if (gameIds && gameIds.length > 0) {
        const values = gameIds.map(id_juego => [id_descuento, id_juego]);
        await connection.query(
          `INSERT INTO descuento_juegos (id_descuento, id_juego) VALUES ?`,
          [values]
        );
      }

      await connection.commit();
      return id_descuento;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Obtiene todas las campañas de descuento con nombres de creadores, juegos asociados y estado de vigencia.
   */
  async getAllDiscounts() {
    const [rows] = await pool.query(
      `SELECT d.*, u.nickname AS creador_nombre,
              GROUP_CONCAT(DISTINCT dj.id_juego) AS juegos_ids,
              GROUP_CONCAT(DISTINCT j.nombre SEPARATOR '||') AS juegos_nombres,
              CASE
                WHEN CURRENT_DATE < d.fecha_inicio THEN 'Programada'
                WHEN CURRENT_DATE > d.fecha_fin THEN 'Expirada'
                ELSE 'Activa'
              END AS estado
       FROM descuentos d
       JOIN usuarios u ON d.creado_por = u.id_usuario
       LEFT JOIN descuento_juegos dj ON d.id_descuento = dj.id_descuento
       LEFT JOIN juegos_referencia j ON dj.id_juego = j.id_juego
       GROUP BY d.id_descuento
       ORDER BY d.creado_en DESC`
    );

    return rows.map(r => ({
      ...r,
      porcentaje: parseFloat(r.porcentaje),
      juegos_asociados: r.juegos_ids ? r.juegos_ids.split(',').map(Number) : [],
      juegos_nombres: r.juegos_nombres ? r.juegos_nombres.split('||') : []
    }));
  }

  /**
   * Consulta todas las ofertas activas vigentes hoy y retorna un Map indexado por id_juego.
   * @returns {Promise<Map<number, Object>>} Map de id_juego -> { id_descuento, nombre, porcentaje }
   */
  async getAllActiveDiscountsMap() {
    const [rows] = await pool.query(
      `SELECT dj.id_juego, d.id_descuento, d.nombre, d.porcentaje
       FROM descuentos d
       JOIN descuento_juegos dj ON d.id_descuento = dj.id_descuento
       WHERE CURRENT_DATE BETWEEN d.fecha_inicio AND d.fecha_fin
       ORDER BY d.porcentaje DESC`
    );

    const discountMap = new Map();
    for (const row of rows) {
      const gameId = Number(row.id_juego);
      if (!discountMap.has(gameId)) {
        discountMap.set(gameId, {
          id_descuento: row.id_descuento,
          nombre: row.nombre,
          porcentaje: parseFloat(row.porcentaje)
        });
      }
    }
    return discountMap;
  }

  /**
   * Obtiene la oferta activa de mayor porcentaje para un juego individual.
   */
  async getActiveDiscountForGame(id_juego) {
    const [rows] = await pool.query(
      `SELECT d.id_descuento, d.nombre, d.porcentaje
       FROM descuentos d
       JOIN descuento_juegos dj ON d.id_descuento = dj.id_descuento
       WHERE dj.id_juego = ?
         AND CURRENT_DATE BETWEEN d.fecha_inicio AND d.fecha_fin
       ORDER BY d.porcentaje DESC
       LIMIT 1`,
      [id_juego]
    );
    return rows[0] ? { ...rows[0], porcentaje: parseFloat(rows[0].porcentaje) } : null;
  }

  /**
   * Elimina una campaña de descuento.
   */
  async deleteDiscount(id_descuento) {
    const [result] = await pool.query(
      `DELETE FROM descuentos WHERE id_descuento = ?`,
      [id_descuento]
    );
    return result.affectedRows > 0;
  }
}

module.exports = DiscountDAO;
