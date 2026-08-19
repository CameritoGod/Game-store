import api from "./userApi";

export const getAllPurchases = async () => {
  const { data } = await api.get("/admin/purchases");
  return data;
};

export const addDiscount = async (discountData) => {
  const { data } = await api.post("/admin/discounts", discountData);
  return data;
}