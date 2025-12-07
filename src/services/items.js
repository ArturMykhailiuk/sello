import api from "./api";

export const createItem = async (itemData) => {
  const response = await api.post("/items", itemData);
  return response.data?.data?.item;
};

export const getItems = async () => {
  const response = await api.get("/items", { params: { limit: 1000 } });
  return response.data?.data?.items ?? [];
};
