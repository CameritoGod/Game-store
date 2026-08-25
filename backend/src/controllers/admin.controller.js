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
    const { nombre, descripcion, porcentaje, fecha_inicio, fecha_fin, gameIds } = req.body;

    if (!nombre || !porcentaje || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ message: 'Nombre, porcentaje, fecha_inicio y fecha_fin son obligatorios' });
    }

    const discountId = await discountDAO.createDiscount(
      {
        nombre,
        descripcion,
        porcentaje: parseFloat(porcentaje),
        fecha_inicio,
        fecha_fin,
        creado_por: req.user.id_usuario
      },
      Array.isArray(gameIds) ? gameIds.map(Number) : []
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
