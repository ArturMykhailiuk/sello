import api from "./api";

export const fetchCategories = async (page = 1, limit = 10) => {
  const response = await api.get("/categories", {
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
