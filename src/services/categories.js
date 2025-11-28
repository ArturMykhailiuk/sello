import api from "./api";

export const fetchCategories = async (page, limit) => {
  const response = await api.get("/categories?page=1&limit=100", {
    params: {
      page,
      limit,
    },
  });
  return {
    total: response.data?.data?.total ?? 0,
    categories: response.data?.data?.categories ?? [],
  };
};
