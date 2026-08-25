import api from "./userApi";

export const getAdminMetrics = async () => {
  const { data } = await api.get("/admin/metrics");
  return data;
};

export const getAllPurchases = async () => {
  const { data } = await api.get("/admin/purchases");
  return data;
};

export const getCatalog = async () => {
  const { data } = await api.get("/admin/catalog");
  return data;
};

export const setCatalogPrice = async (priceData) => {
  const { data } = await api.post("/admin/catalog/price", priceData);
  return data;
};

export const getDiscounts = async () => {
  const { data } = await api.get("/admin/discounts");
  return data;
};

export const addDiscount = async (discountData) => {
  const { data } = await api.post("/admin/discounts", discountData);
  return data;
};

export const deleteDiscount = async (discountId) => {
  const { data } = await api.delete(`/admin/discounts/${discountId}`);
  return data;
};