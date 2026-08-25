const IPurchaseDAO = require('../../interfaces/IPurchaseDAO');
const pool = require('../../config/db');
const GameReferenceDAO = require('./GameReferenceDAO');

class PurchaseDAO extends IPurchaseDAO {
  constructor() {
    super();
    this.gameRefDAO = new GameReferenceDAO();
  }

  async processCheckout(id_usuario, items) {
    if (!items || items.length === 0) {
      throw new Error("El carrito de compras está vacío");
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      let subtotal = 0;
      let descuento_total = 0;
      const detailItems = [];

      for (const item of items) {
        const id_juego = Number(item.id || item.id_juego);
        const nombre = item.title || item.nombre || `Juego #${id_juego}`;
        const imagen_url = item.cover || item.imagen_url || null;
        const precio_unitario = parseFloat(item.price || item.precio || 0);

        // 1. Asegurar existencia de la referencia del juego
        await connection.query(
          `INSERT INTO JUEGOS_REFERENCIA (id_juego, nombre, imagen_url)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE
             nombre = VALUES(nombre),
             imagen_url = VALUES(imagen_url)`,
          [id_juego, nombre, imagen_url]
        );

        // 2. Buscar si hay descuento activo para el juego
        const [discRows] = await connection.query(
          `SELECT d.porcentaje
           FROM DESCUENTOS d
           JOIN DESCUENTO_JUEGOS dj ON d.id_descuento = dj.id_descuento
           WHERE dj.id_juego = ?
             AND CURRENT_DATE BETWEEN d.fecha_inicio AND d.fecha_fin
           ORDER BY d.porcentaje DESC
           LIMIT 1`,
          [id_juego]
        );

        const descuento_aplicado = discRows.length > 0 ? parseFloat(discRows[0].porcentaje) : 0;
        const monto_descuento = (precio_unitario * descuento_aplicado) / 100;
        const precio_final = Math.max(0, precio_unitario - monto_descuento);

        subtotal += precio_unitario;
        descuento_total += monto_descuento;

        detailItems.push({
          id_juego,
          precio_unitario,
          descuento_aplicado,
          precio_final
        });
      }

      const total = Math.max(0, subtotal - descuento_total);

      // 3. Insertar la cabecera de la compra
      const [compraResult] = await connection.query(
        `INSERT INTO COMPRAS (id_usuario, subtotal, descuento_total, total)
         VALUES (?, ?, ?, ?)`,
        [id_usuario, subtotal, descuento_total, total]
      );
      const id_compra = compraResult.insertId;

      // 4. Insertar los detalles de compra y agregar a BIBLIOTECA
      for (const detail of detailItems) {
        await connection.query(
          `INSERT INTO DETALLE_COMPRAS (id_compra, id_juego, precio_unitario, descuento_aplicado, precio_final)
           VALUES (?, ?, ?, ?, ?)`,
          [id_compra, detail.id_juego, detail.precio_unitario, detail.descuento_aplicado, detail.precio_final]
        );

        await connection.query(
          `INSERT INTO BIBLIOTECA (id_usuario, id_juego, id_compra)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE id_compra = VALUES(id_compra)`,
          [id_usuario, detail.id_juego, id_compra]
        );
      }

      await connection.commit();

      return {
        id_compra,
        id_usuario,
        subtotal,
        descuento_total,
        total,
        itemsCount: detailItems.length
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getUserPurchases(id_usuario) {
    const [rows] = await pool.query(
      `SELECT c.id_compra, c.fecha_compra, c.subtotal, c.descuento_total, c.total,
              d.id_detalle, d.id_juego, d.precio_unitario, d.descuento_aplicado, d.precio_final,
              j.nombre, j.imagen_url
       FROM COMPRAS c
       JOIN DETALLE_COMPRAS d ON c.id_compra = d.id_compra
       JOIN JUEGOS_REFERENCIA j ON d.id_juego = j.id_juego
       WHERE c.id_usuario = ?
       ORDER BY c.fecha_compra DESC`,
      [id_usuario]
    );

    // Agrupar compras por id_compra
    const purchasesMap = new Map();
    for (const r of rows) {
      if (!purchasesMap.has(r.id_compra)) {
        purchasesMap.set(r.id_compra, {
          id_compra: r.id_compra,
          fecha_compra: r.fecha_compra,
          subtotal: r.subtotal,
          descuento_total: r.descuento_total,
          total: r.total,
          detalles: []
        });
      }
      purchasesMap.get(r.id_compra).detalles.push({
        id_detalle: r.id_detalle,
        id_juego: r.id_juego,
        nombre: r.nombre,
        imagen_url: r.imagen_url,
        precio_unitario: r.precio_unitario,
        descuento_aplicado: r.descuento_aplicado,
        precio_final: r.precio_final
      });
    }

    return Array.from(purchasesMap.values());
  }

  async getAllPurchases() {
    const [rows] = await pool.query(
      `SELECT c.id_compra, c.fecha_compra, c.subtotal, c.descuento_total, c.total,
              u.id_usuario, u.nombre AS usuario_nombre, u.nickname, u.email,
              d.id_detalle, d.id_juego, d.precio_unitario, d.descuento_aplicado, d.precio_final,
              j.nombre AS juego_nombre, j.imagen_url
       FROM COMPRAS c
       JOIN USUARIOS u ON c.id_usuario = u.id_usuario
       JOIN DETALLE_COMPRAS d ON c.id_compra = d.id_compra
       JOIN JUEGOS_REFERENCIA j ON d.id_juego = j.id_juego
       ORDER BY c.fecha_compra DESC`
    );

    const purchasesMap = new Map();
    for (const r of rows) {
      if (!purchasesMap.has(r.id_compra)) {
        purchasesMap.set(r.id_compra, {
          id_compra: r.id_compra,
          fecha_compra: r.fecha_compra,
          subtotal: r.subtotal,
          descuento_total: r.descuento_total,
          total: r.total,
          usuario: {
            id_usuario: r.id_usuario,
            nombre: r.usuario_nombre,
            nickname: r.nickname,
            email: r.email
          },
          detalles: []
        });
      }
      purchasesMap.get(r.id_compra).detalles.push({
        id_detalle: r.id_detalle,
        id_juego: r.id_juego,
        nombre: r.juego_nombre,
        imagen_url: r.imagen_url,
        precio_unitario: r.precio_unitario,
        descuento_aplicado: r.descuento_aplicado,
        precio_final: r.precio_final
      });
    }

    return Array.from(purchasesMap.values());
  }

  async getAdminMetrics() {
    const [[rev]] = await pool.query(`SELECT COALESCE(SUM(total), 0) AS total_revenue FROM COMPRAS`);
    const [[sales]] = await pool.query(`SELECT COUNT(*) AS total_sales FROM COMPRAS`);
    const [[users]] = await pool.query(`SELECT COUNT(*) AS total_users FROM USUARIOS`);
    const [[disc]] = await pool.query(`SELECT COUNT(*) AS active_discounts FROM DESCUENTOS WHERE CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin`);

    return {
      totalRevenue: parseFloat(rev.total_revenue),
      totalSales: parseInt(sales.total_sales, 10),
      totalUsers: parseInt(users.total_users, 10),
      activeDiscounts: parseInt(disc.active_discounts, 10)
    };
  }
}

module.exports = PurchaseDAO;
