import api from "./userApi";

/**
 * Consulta las métricas globales del panel de administración (ingresos, ventas, usuarios).
 */
export const getAdminMetrics = async () => {
  const { data } = await api.get("/admin/metrics");
  return data;
};

/**
 * Consulta el historial de todas las órdenes de compra de la tienda.
 */
export const getAllPurchases = async () => {
  const { data } = await api.get("/admin/purchases");
  return data;
};

/**
 * Consulta los juegos registrados en el catálogo comercial.
 */
export const getCatalog = async () => {
  const { data } = await api.get("/admin/catalog");
  return data;
};

/**
 * Establece o actualiza el precio y estado de un juego en el catálogo.
 */
export const setCatalogPrice = async (priceData) => {
  const { data } = await api.post("/admin/catalog/price", priceData);
  return data;
};

/**
 * Alterna el estado activo / inactivo de un juego en el catálogo comercial.
 */
export const toggleCatalogStatus = async (statusData) => {
  const { data } = await api.put("/admin/catalog/toggle", statusData);
  return data;
};

/**
 * Consulta todas las campañas de descuento configuradas.
 */
export const getDiscounts = async () => {
  const { data } = await api.get("/admin/discounts");
  return data;
};

/**
 * Crea una nueva campaña de descuento promocional.
 */
export const addDiscount = async (discountData) => {
  const { data } = await api.post("/admin/discounts", discountData);
  return data;
};

/**
 * Elimina una campaña de descuento por su identificador.
 */
export const deleteDiscount = async (discountId) => {
  const { data } = await api.delete(`/admin/discounts/${discountId}`);
  return data;
};