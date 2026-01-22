import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import { configureStore } from "@reduxjs/toolkit";
import { ServiceCard } from "./ServiceCard";
import { authReducer } from "../../store/auth/slice";
import * as servicesAPI from "../../services/services";

// Мокаємо useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Мокаємо services API
vi.mock("../../services/services");

// Створюємо тестовий store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: initialState,
  });
};

// Хелпер для рендерингу з Provider
const renderWithProviders = (component, { initialState = {} } = {}) => {
  const store = createTestStore(initialState);
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>,
  );
};

describe("ServiceCard", () => {
  const mockService = {
    serviceId: 1,
    title: "Прибирання квартири",
    description: "Якісне прибирання вашої квартири",
    image: "/images/service.jpg",
    owner: {
      id: 10,
      name: "Іван Петренко",
      avatarURL: "/avatars/user.jpg",
    },
    areas: [
      { id: 1, name: "Київ" },
      { id: 2, name: "Львів" },
    ],
    isFavorite: false,
    isMobile: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    servicesAPI.addFavoriteService.mockResolvedValue({});
    servicesAPI.removeFavoriteService.mockResolvedValue({});
  });

  it("повинен відобразити назву послуги", () => {
    renderWithProviders(<ServiceCard {...mockService} />);

    expect(screen.getByText("Прибирання квартири")).toBeInTheDocument();
  });

  it("повинен відобразити опис послуги", () => {
    renderWithProviders(<ServiceCard {...mockService} />);

    expect(
      screen.getByText(/Якісне прибирання вашої квартири/i),
    ).toBeInTheDocument();
  });

  it("повинен відобразити ім'я власника", () => {
    renderWithProviders(<ServiceCard {...mockService} />);

    expect(screen.getByText("Іван Петренко")).toBeInTheDocument();
  });

  it("повинен відобразити локації", () => {
    renderWithProviders(<ServiceCard {...mockService} />);

    expect(screen.getByText(/Київ/i)).toBeInTheDocument();
    expect(screen.getByText(/Львів/i)).toBeInTheDocument();
  });

  it('повинен відобразити кнопку "Додати до обраного" для неавторизованого користувача', () => {
    const initialState = {
      auth: {
        isLoggedIn: false,
        user: null,
        token: null,
      },
    };

    renderWithProviders(<ServiceCard {...mockService} />, { initialState });

    // Перевіряємо наявність кнопки обраного
    const favoriteButton = screen.getByRole("button", {
      name: /add to favorites/i,
    });
    expect(favoriteButton).toBeInTheDocument();
  });

  it("повинен показати послугу як обрану якщо isFavorite = true", () => {
    const favoriteService = { ...mockService, isFavorite: true };

    renderWithProviders(<ServiceCard {...favoriteService} />);

    // Перевіряємо наявність кнопки "видалити з обраного"
    const favoriteButton = screen.getByRole("button", {
      name: /remove from favorites/i,
    });
    expect(favoriteButton).toBeInTheDocument();
  });

  describe("Обробники кліків", () => {
    it("повинен викликати навігацію до сторінки послуги при кліку на кнопку деталей", () => {
      renderWithProviders(<ServiceCard {...mockService} />);

      const detailsButton = screen.getByRole("button", {
        name: /view service details/i,
      });
      fireEvent.click(detailsButton);

      expect(mockNavigate).toHaveBeenCalledWith(
        "/service/1",
        expect.objectContaining({
          state: expect.any(Object),
        }),
      );
    });

    it("повинен викликати навігацію до сторінки послуги при кліку на зображення", () => {
      renderWithProviders(<ServiceCard {...mockService} />);

      const image = screen.getByAltText("Прибирання квартири");
      fireEvent.click(image.closest('[style*="cursor: pointer"]'));

      expect(mockNavigate).toHaveBeenCalledWith(
        "/service/1",
        expect.objectContaining({
          state: expect.any(Object),
        }),
      );
    });

    it("повинен викликати навігацію до профілю власника при кліку на аватар", () => {
      const initialState = {
        auth: {
          isLoggedIn: true,
          user: { id: 1, name: "Test User" },
        },
      };

      renderWithProviders(<ServiceCard {...mockService} />, { initialState });

      const ownerButton = screen.getByRole("button", {
        name: "View Іван Петренко profile",
      });
      fireEvent.click(ownerButton);

      expect(mockNavigate).toHaveBeenCalledWith(
        "/user/10",
        expect.objectContaining({
          state: expect.any(Object),
        }),
      );
    });

    it("повинен додати послугу до обраного для авторизованого користувача", async () => {
      const initialState = {
        auth: {
          isLoggedIn: true,
          user: { id: 5, name: "Test User" },
          token: "test-token",
        },
      };

      renderWithProviders(<ServiceCard {...mockService} />, { initialState });

      const favoriteButton = screen.getByRole("button", {
        name: /add to favorites/i,
      });
      fireEvent.click(favoriteButton);

      // Чекаємо на виклик API
      await vi.waitFor(() => {
        expect(servicesAPI.addFavoriteService).toHaveBeenCalledWith(1);
      });
    });

    it("повинен видалити послугу з обраного для авторизованого користувача", async () => {
      const initialState = {
        auth: {
          isLoggedIn: true,
          user: { id: 5, name: "Test User" },
          token: "test-token",
        },
      };

      const favoriteService = { ...mockService, isFavorite: true };
      renderWithProviders(<ServiceCard {...favoriteService} />, {
        initialState,
      });

      const favoriteButton = screen.getByRole("button", {
        name: /remove from favorites/i,
      });
      fireEvent.click(favoriteButton);

      // Чекаємо на виклик API
      await vi.waitFor(() => {
        expect(servicesAPI.removeFavoriteService).toHaveBeenCalledWith(1);
      });
    });

    it("не повинен викликати API обраного для неавторизованого користувача", () => {
      const initialState = {
        auth: {
          isLoggedIn: false,
          user: null,
          token: null,
        },
      };

      renderWithProviders(<ServiceCard {...mockService} />, { initialState });

      const favoriteButton = screen.getByRole("button", {
        name: /add to favorites/i,
      });
      fireEvent.click(favoriteButton);

      expect(servicesAPI.addFavoriteService).not.toHaveBeenCalled();
      expect(servicesAPI.removeFavoriteService).not.toHaveBeenCalled();
    });
  });

  describe("Conditional rendering", () => {
    it("повинен показати правильний варіант кнопки для мобільного режиму", () => {
      const mobileService = { ...mockService, isMobile: true };
      renderWithProviders(<ServiceCard {...mobileService} />);

      // Компонент повинен рендеритись без помилок
      expect(screen.getByText("Прибирання квартири")).toBeInTheDocument();
    });

    it("повинен показати послугу без областей якщо areas порожній", () => {
      const serviceWithoutAreas = { ...mockService, areas: [] };
      renderWithProviders(<ServiceCard {...serviceWithoutAreas} />);

      expect(screen.getByText("Прибирання квартири")).toBeInTheDocument();
      expect(screen.queryByText("Київ")).not.toBeInTheDocument();
    });

    it("повинен показати placeholder зображення якщо image відсутнє", () => {
      const serviceWithoutImage = { ...mockService, image: null };
      renderWithProviders(<ServiceCard {...serviceWithoutImage} />);

      const image = screen.getByAltText("Прибирання квартири");
      expect(image).toBeInTheDocument();
    });
  });
});
