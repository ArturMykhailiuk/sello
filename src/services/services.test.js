import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getServiceById,
  addService,
  deleteServiceById,
  getServices,
  updateService,
  addFavoriteService,
  removeFavoriteService,
} from "./services";
import api from "./api";

// Мокаємо API модуль
vi.mock("./api");

describe("Services API", () => {
  beforeEach(() => {
    // Очищуємо моки перед кожним тестом
    vi.clearAllMocks();
  });

  describe("getServiceById", () => {
    it("повинен отримати послугу за ID", async () => {
      // Arrange - підготовка
      const mockService = {
        id: 1,
        title: "Прибирання квартири",
        description: "Якісне прибирання",
        owner: { id: 10, name: "Іван" },
      };

      api.get.mockResolvedValue({
        data: {
          data: {
            service: mockService,
          },
        },
      });

      // Act - виконання
      const result = await getServiceById(1);

      // Assert - перевірка
      expect(api.get).toHaveBeenCalledWith("/services/1");
      expect(result).toEqual(mockService);
      expect(result.title).toBe("Прибирання квартири");
    });

    it("повинен кинути помилку якщо послуга не знайдена", async () => {
      // Arrange
      api.get.mockRejectedValue({
        response: {
          status: 404,
          data: { message: "Service not found" },
        },
      });

      // Act & Assert
      await expect(getServiceById(999)).rejects.toThrow();
      expect(api.get).toHaveBeenCalledWith("/services/999");
    });
  });

  describe("addService", () => {
    it("повинен створити нову послугу", async () => {
      // Arrange
      const newServiceData = {
        title: "Нова послугу",
        description: "Опис",
        categoryId: 1,
      };

      const createdService = {
        id: 123,
        ...newServiceData,
      };

      api.post.mockResolvedValue({
        data: {
          data: createdService,
        },
      });

      // Act
      const result = await addService(newServiceData);

      // Assert
      expect(api.post).toHaveBeenCalledWith("/services", newServiceData);
      expect(result.id).toBe(123);
      expect(result.title).toBe("Нова послугу");
    });
  });

  describe("deleteServiceById", () => {
    it("повинен видалити послугу", async () => {
      // Arrange
      api.delete.mockResolvedValue({
        data: {
          data: { message: "Service deleted" },
        },
      });

      // Act
      await deleteServiceById(1);

      // Assert
      expect(api.delete).toHaveBeenCalledWith("/services/1");
    });
  });

  describe("getServices", () => {
    it("повинен отримати список послуг без параметрів", async () => {
      // Arrange
      const mockServices = {
        total: 100,
        services: [
          { id: 1, title: "Послуга 1" },
          { id: 2, title: "Послуга 2" },
        ],
      };

      api.get.mockResolvedValue({
        data: {
          data: mockServices,
        },
      });

      // Act
      const result = await getServices({});

      // Assert
      expect(api.get).toHaveBeenCalledWith("/services", {
        params: {},
        signal: undefined,
      });
      expect(result.total).toBe(100);
      expect(result.services).toHaveLength(2);
    });

    it("повинен отримати послуги з параметрами пагінації", async () => {
      // Arrange
      const mockServices = {
        total: 50,
        services: [{ id: 1, title: "Послуга 1" }],
      };

      api.get.mockResolvedValue({
        data: {
          data: mockServices,
        },
      });

      // Act
      const result = await getServices({ page: 2, limit: 10 });

      // Assert
      expect(api.get).toHaveBeenCalledWith("/services", {
        params: { page: 2, limit: 10 },
        signal: undefined,
      });
      expect(result.total).toBe(50);
    });

    it("повинен отримати послуги з параметрами фільтрації", async () => {
      // Arrange
      const mockServices = {
        total: 25,
        services: [{ id: 1, title: "Прибирання", categoryId: 3 }],
      };

      api.get.mockResolvedValue({
        data: {
          data: mockServices,
        },
      });

      // Act
      const result = await getServices({
        categoryId: 3,
        areaId: 5,
        itemId: 7,
      });

      // Assert
      expect(api.get).toHaveBeenCalledWith("/services", {
        params: {
          categoryId: 3,
          areaId: 5,
          itemId: 7,
        },
        signal: undefined,
      });
      expect(result.services[0].categoryId).toBe(3);
    });

    it("повинен передати signal для скасування запиту", async () => {
      // Arrange
      const abortController = new AbortController();
      const mockServices = {
        total: 10,
        services: [],
      };

      api.get.mockResolvedValue({
        data: {
          data: mockServices,
        },
      });

      // Act
      await getServices({ page: 1 }, { signal: abortController.signal });

      // Assert
      expect(api.get).toHaveBeenCalledWith("/services", {
        params: { page: 1 },
        signal: abortController.signal,
      });
    });
  });

  describe("updateService", () => {
    it("повинен оновити послугу за ID", async () => {
      // Arrange
      const updatedData = {
        title: "Оновлена назва",
        description: "Новий опис",
      };

      const updatedService = {
        id: 1,
        ...updatedData,
      };

      api.patch.mockResolvedValue({
        data: {
          data: updatedService,
        },
      });

      // Act
      const result = await updateService(1, updatedData);

      // Assert
      expect(api.patch).toHaveBeenCalledWith("/services/1", updatedData);
      expect(result.title).toBe("Оновлена назва");
      expect(result.description).toBe("Новий опис");
    });

    it("повинен кинути помилку при невдалому оновленні", async () => {
      // Arrange
      api.patch.mockRejectedValue({
        response: {
          status: 400,
          data: { message: "Validation error" },
        },
      });

      // Act & Assert
      await expect(updateService(1, { title: "" })).rejects.toThrow();
      expect(api.patch).toHaveBeenCalledWith("/services/1", { title: "" });
    });
  });

  describe("toggleFavorite (addFavoriteService / removeFavoriteService)", () => {
    it("повинен додати послугу до обраного", async () => {
      // Arrange
      const mockResponse = {
        message: "Service added to favorites",
        serviceId: 5,
      };

      api.post.mockResolvedValue({
        data: {
          data: mockResponse,
        },
      });

      // Act
      const result = await addFavoriteService(5);

      // Assert
      expect(api.post).toHaveBeenCalledWith("/services/favorites/5");
      expect(result.serviceId).toBe(5);
    });

    it("повинен видалити послугу з обраного", async () => {
      // Arrange
      const mockResponse = {
        message: "Service removed from favorites",
        serviceId: 5,
      };

      api.delete.mockResolvedValue({
        data: {
          data: mockResponse,
        },
      });

      // Act
      const result = await removeFavoriteService(5);

      // Assert
      expect(api.delete).toHaveBeenCalledWith("/services/favorites/5");
      expect(result.serviceId).toBe(5);
    });

    it("повинен обробити помилку при додаванні до обраного", async () => {
      // Arrange
      api.post.mockRejectedValue({
        response: {
          status: 401,
          data: { message: "Unauthorized" },
        },
      });

      // Act & Assert
      await expect(addFavoriteService(5)).rejects.toThrow();
      expect(api.post).toHaveBeenCalledWith("/services/favorites/5");
    });
  });
});
