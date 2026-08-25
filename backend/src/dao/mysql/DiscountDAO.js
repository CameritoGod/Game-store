const IDiscountDAO = require('../../interfaces/IDiscountDAO');
const pool = require('../../config/db');

class DiscountDAO extends IDiscountDAO {
  async createDiscount(discountData, gameIds = []) {
    const { nombre, descripcion, porcentaje, fecha_inicio, fecha_fin, creado_por } = discountData;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        `INSERT INTO DESCUENTOS (nombre, descripcion, porcentaje, fecha_inicio, fecha_fin, creado_por)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [nombre, descripcion || null, porcentaje, fecha_inicio, fecha_fin, creado_por]
      );
      const id_descuento = result.insertId;

      if (gameIds && gameIds.length > 0) {
        const values = gameIds.map(id_juego => [id_descuento, id_juego]);
        await connection.query(
          `INSERT INTO DESCUENTO_JUEGOS (id_descuento, id_juego) VALUES ?`,
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

  async getAllDiscounts() {
    const [rows] = await pool.query(
      `SELECT d.*, u.nickname AS creador_nombre,
              GROUP_CONCAT(dj.id_juego) AS juegos_asociados
       FROM DESCUENTOS d
       JOIN USUARIOS u ON d.creado_por = u.id_usuario
       LEFT JOIN DESCUENTO_JUEGOS dj ON d.id_descuento = dj.id_descuento
       GROUP BY d.id_descuento
       ORDER BY d.creado_en DESC`
    );

    return rows.map(r => ({
      ...r,
      juegos_asociados: r.juegos_asociados ? r.juegos_asociados.split(',').map(Number) : []
    }));
  }

  async getActiveDiscountForGame(id_juego) {
    const [rows] = await pool.query(
      `SELECT d.id_descuento, d.nombre, d.porcentaje
       FROM DESCUENTOS d
       JOIN DESCUENTO_JUEGOS dj ON d.id_descuento = dj.id_descuento
       WHERE dj.id_juego = ?
         AND CURRENT_DATE BETWEEN d.fecha_inicio AND d.fecha_fin
       ORDER BY d.porcentaje DESC
       LIMIT 1`,
      [id_juego]
    );
    return rows[0] || null;
  }

  async deleteDiscount(id_descuento) {
    const [result] = await pool.query(
      `DELETE FROM DESCUENTOS WHERE id_descuento = ?`,
      [id_descuento]
    );
    return result.affectedRows > 0;
  }
}

module.exports = DiscountDAO;
