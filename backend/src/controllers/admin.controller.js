const PurchaseDAO = require('../dao/mysql/PurchaseDAO');
const CatalogDAO = require('../dao/mysql/CatalogDAO');
const DiscountDAO = require('../dao/mysql/DiscountDAO');
const GameReferenceDAO = require('../dao/mysql/GameReferenceDAO');

const purchaseDAO = new PurchaseDAO();
const catalogDAO = new CatalogDAO();
const discountDAO = new DiscountDAO();
const gameRefDAO = new GameReferenceDAO();

exports.getMetrics = async (req, res, next) => {
  try {
    const metrics = await purchaseDAO.getAdminMetrics();
    res.json(metrics);
  } catch (error) {
    next(error);
  }
};

exports.getAllPurchases = async (req, res, next) => {
  try {
    const purchases = await purchaseDAO.getAllPurchases();
    res.json(purchases);
  } catch (error) {
    next(error);
  }
};

exports.getCatalog = async (req, res, next) => {
  try {
    const catalog = await catalogDAO.findAll();
    res.json(catalog);
  } catch (error) {
    next(error);
  }
};

exports.setCatalogPrice = async (req, res, next) => {
  try {
    const { id_juego, nombre, imagen_url, precio_actual, activo } = req.body;
    if (!id_juego || precio_actual === undefined || precio_actual === null) {
      return res.status(400).json({ message: 'Se requiere id_juego y precio_actual' });
    }

    // Asegurar que el juego existe en JUEGOS_REFERENCIA
    if (nombre) {
      await gameRefDAO.upsert(Number(id_juego), nombre, imagen_url);
    }

    await catalogDAO.setPrice(Number(id_juego), parseFloat(precio_actual), activo !== false);
    res.json({ message: 'Precio de catálogo actualizado con éxito' });
  } catch (error) {
    next(error);
  }
};

exports.toggleCatalogStatus = async (req, res, next) => {
  try {
    const { id_juego, activo } = req.body;
    if (!id_juego || activo === undefined) {
      return res.status(400).json({ message: 'Se requiere id_juego y estado activo' });
    }
    await catalogDAO.toggleActive(Number(id_juego), Boolean(activo));
    res.json({ message: 'Estado de visibilidad en catálogo actualizado' });
  } catch (error) {
    next(error);
  }
};

exports.getDiscounts = async (req, res, next) => {
  try {
    const discounts = await discountDAO.getAllDiscounts();
    res.json(discounts);
  } catch (error) {
    next(error);
  }
};

exports.createDiscount = async (req, res, next) => {
  try {
    const { nombre, descripcion, porcentaje, fecha_inicio, fecha_fin, gameIds, games } = req.body;

    if (!nombre || porcentaje === undefined || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ message: 'Nombre, porcentaje, fecha_inicio y fecha_fin son obligatorios' });
    }

    const pct = parseFloat(porcentaje);
    if (isNaN(pct) || pct < 1 || pct > 100) {
      return res.status(400).json({ message: 'El porcentaje de descuento debe estar entre 1% y 100%' });
    }

    if (new Date(fecha_fin) < new Date(fecha_inicio)) {
      return res.status(400).json({ message: 'La fecha de fin debe ser posterior o igual a la fecha de inicio' });
    }

    // Asegurar referencias de juegos en JUEGOS_REFERENCIA antes de asociar
    const finalGameIds = [];

    if (Array.isArray(games) && games.length > 0) {
      for (const g of games) {
        const gId = Number(g.id || g.id_juego);
        if (gId) {
          await gameRefDAO.upsert(
            gId,
            g.name || g.nombre || `Juego #${gId}`,
            g.image || g.cover || g.imagen_url || null
          );
          finalGameIds.push(gId);
        }
      }
    } else if (Array.isArray(gameIds)) {
      for (const gId of gameIds.map(Number)) {
        if (gId) {
          await gameRefDAO.upsert(gId, `Juego #${gId}`, null);
          finalGameIds.push(gId);
        }
      }
    }

    const discountId = await discountDAO.createDiscount(
      {
        nombre,
        descripcion,
        porcentaje: pct,
        fecha_inicio,
        fecha_fin,
        creado_por: req.user.id_usuario
      },
      finalGameIds
    );

    res.status(201).json({ message: 'Campaña de descuento creada con éxito', id_descuento: discountId });
  } catch (error) {
    next(error);
  }
};

exports.deleteDiscount = async (req, res, next) => {
  try {
    const discountId = parseInt(req.params.id, 10);
    await discountDAO.deleteDiscount(discountId);
    res.json({ message: 'Descuento eliminado con éxito' });
  } catch (error) {
    next(error);
  }
};
