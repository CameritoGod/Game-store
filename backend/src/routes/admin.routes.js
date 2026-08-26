const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const roleAdmin = require('../middleware/roleMiddleware');

// Aplicar authMiddleware y roleMiddleware a todas las rutas de admin
router.use(authMiddleware);
router.use(roleAdmin('admin'));

// Métricas e Historial Global
router.get('/metrics', adminController.getMetrics);
router.get('/purchases', adminController.getAllPurchases);

// Catálogo y Precios
router.get('/catalog', adminController.getCatalog);
router.post('/catalog/price', adminController.setCatalogPrice);
router.put('/catalog/toggle', adminController.toggleCatalogStatus);

// Campañas de Descuento
router.get('/discounts', adminController.getDiscounts);
router.post('/discounts', adminController.createDiscount);
router.delete('/discounts/:id', adminController.deleteDiscount);

module.exports = router;
