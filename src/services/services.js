import api from "./api";

export const getServices = async (
  { page, limit, categoryId, areaId, itemId },
  options = {},
) => {
  const { signal } = options;
  const { data } = await api.get(`/services`, {
    params: {
      ...(page ? { page } : {}),
      ...(limit ? { limit } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(areaId ? { areaId } : {}),
      ...(itemId ? { itemId } : {}),
    },
    signal,
  });
  return {
    total: data.data.total,
    services: data.data.services,
  };
};

export const getServicesByUserId = async (userId, { page, limit }) => {
  const response = await api.get(`/services`, {
    params: {
      page,
      limit,
      ownerId: userId,
    },
  });
  return {
    total: response.data?.data?.total ?? 0,
    items: response.data?.data?.services ?? [],
  };
};

export const getFavoriteServices = async ({ page, limit }) => {
  const response = await api.get(`/services/favorites`, {
    params: { page, limit },
  });
  return {
    total: response.data?.data?.total ?? 0,
    items: response.data?.data?.favoriteServices ?? [],
  };
};

export const getServiceById = async (id) => {
  const { data } = await api.get(`/services/${id}`);
  return data.data.service;
};

export const getPopularServices = async () => {
  const { data } = await api.get("/services/popular?limit=10&page=1");
  return { popularServices: data.data.popularServices };
};

export const deleteServiceById = async (serviceId) => {
  const response = await api.delete(`/services/${serviceId}`);
  return response.data?.data;
};

export const removeFavoriteService = async (serviceId) => {
  const response = await api.delete(`/services/favorites/${serviceId}`);
  return response.data?.data;
};

export const addFavoriteService = async (serviceId) => {
  const response = await api.post(`/services/favorites/${serviceId}`);
  return response.data?.data;
};

export const addService = async (service) => {
  const response = await api.post("/services", service);
  return response.data?.data;
};
