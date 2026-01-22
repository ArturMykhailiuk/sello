# Frontend Testing Documentation

## Огляд

Цей документ описує реалізовану інфраструктуру тестування для фронтенд частини проєкту SELL-O (React 19 + Vite).

## Використані технології

- **Vitest 3.1.3** - тестовий фреймворк (альтернатива Jest, оптимізована для Vite)
- **@testing-library/react** - бібліотека для тестування React компонентів
- **@testing-library/jest-dom** - кастомні matchers для DOM assertions
- **happy-dom** - легковаговий DOM environment для Node.js (замість jsdom через несумісність з Node v20.15.1)
- **Supertest** - не використовується на фронтенді (тільки для бекенд API тестів)

## Інфраструктура тестування

### 1. Конфігурація

**vitest.config.js**

```javascript
- Environment: happy-dom
- Setup файли: ./src/test/setup.js
- Coverage provider: v8
- Coverage reporters: text, json, html
```

**src/test/setup.js**

- Глобальні моки: ResizeObserver, matchMedia
- Cleanup після кожного тесту
- Імпорт jest-dom matchers

### 2. Скрипти package.json

```json
{
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest run --coverage"
}
```

## Класифікація створених тестів

### ✅ Unit Tests (Юніт тести)

**Файл**: `src/services/services.test.js` (13 тестів)

**Що тестується**: Функції API клієнта ізольовано від реального API

**Характеристики**:

- ✅ Тестують ОДНУ функцію за раз
- ✅ Всі зовнішні залежності (axios) замоковані
- ✅ Швидкі (без мережевих запитів)
- ✅ Без побічних ефектів

**Покриті функції**:

1. **getServiceById** (2 тести)

   - Успішне отримання сервісу за ID
   - Обробка помилок

2. **addService** (1 тест)

   - Створення нового сервісу

3. **deleteServiceById** (1 тест)

   - Видалення сервісу

4. **getServices** (4 тести)

   - Базовий запит без параметрів
   - З параметрами пагінації
   - З фільтрами (categoryId, areaId, ownerId)
   - Підтримка AbortSignal

5. **updateService** (2 тести)

   - Успішне оновлення
   - Обробка помилок

6. **addFavoriteService / removeFavoriteService** (3 тести)
   - Додавання до обраного
   - Видалення з обраного
   - Обробка помилок

**Приклад**:

```javascript
test("getServiceById повертає дані сервісу", async () => {
  mockGet.mockResolvedValueOnce({ data: { service: mockService } });

  const result = await getServiceById(1);

  expect(mockGet).toHaveBeenCalledWith("/services/1", undefined);
  expect(result).toEqual({ service: mockService });
});
```

**Метрики покриття**:

- Statements: 58.25%
- Branches: 100%
- Functions: 63.63%
- Lines: 58.25%

---

### ✅ Component Tests (Компонентні тести)

**Файл**: `src/components/ServiceCard/ServiceCard.test.jsx` (15 тестів)

**Що тестується**: React компонент ServiceCard з його дочірніми компонентами

**Характеристики**:

- ⚠️ Рендерять компонент + дочірні компоненти (Avatar, ButtonIcon, Image, Typography)
- ✅ Всі зовнішні залежності (Redux store, React Router, API) замоковані
- ✅ Тестують DOM взаємодію та поведінку користувача
- ✅ Відносно швидкі

**Примітка**: В екосистемі React такі тести називаються "unit tests" для компонентів, але технічно це інтеграційні тести, оскільки тестують компонент разом з дочірніми компонентами.

**Групи тестів**:

#### 1. Рендеринг (6 тестів)

- Відображення назви послуги
- Відображення опису
- Відображення імені власника
- Відображення локацій (areas)
- Кнопка "Додати до обраного" для неавторизованого користувача
- Відображення статусу "обране" (isFavorite = true)

#### 2. Обробники кліків (5 тестів)

- Навігація до сторінки послуги при кліку на кнопку деталей
- Навігація до сторінки послуги при кліку на зображення
- Навігація до профілю власника при кліку на аватар (з авторизацією)
- Додавання послуги до обраного (для авторизованого користувача)
- Видалення послуги з обраного (для авторизованого користувача)
- Перевірка, що API не викликається для неавторизованого користувача

#### 3. Conditional Rendering (3 тести)

- Правильний варіант кнопки для мобільного режиму (isMobile)
- Відображення без областей (areas порожній)
- Placeholder зображення (якщо image відсутнє)

**Приклад**:

```javascript
test("повинен викликати навігацію до профілю власника при кліку на аватар", () => {
  const initialState = {
    auth: { isLoggedIn: true, user: { id: 1, name: "Test User" } },
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
```

**Метрики покриття**:

- Statements: 94.55%
- Branches: 85.18%
- Functions: 100%
- Lines: 94.55%
- Непокриті рядки: 66-68, 76-78, 95, 141

**Додаткові компоненти з покриттям** (тестуються опосередковано):

- Avatar: 75.75%
- ButtonIcon: 100%
- Image: 76.47%
- Typography: 83.72%

---

## Accessibility (Доступність)

В процесі тестування були додані aria-labels до всіх інтерактивних елементів ServiceCard:

```javascript
// Кнопка обраного
aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}

// Кнопка деталей
aria-label="View service details"

// Кнопка профілю власника
aria-label={`View ${owner.name} profile`}
```

Це покращує доступність для screen readers та спрощує тестування через `getByRole`.

---

## Моки та Setup

### Redux Store Mock

```javascript
export const renderWithProviders = (
  ui,
  { initialState = {}, ...options } = {},
) => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: initialState,
  });

  return render(<Provider store={store}>{ui}</Provider>, options);
};
```

### React Router Mock

```javascript
vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));
```

### Services API Mock

```javascript
vi.mock("../../services/services", () => ({
  addFavoriteService: vi.fn(),
  removeFavoriteService: vi.fn(),
}));
```

---

## Загальна статистика

### Тести

- **Всього тестів**: 28 (13 unit + 15 component)
- **Всього файлів**: 2
- **Статус**: ✅ Всі тести проходять
- **Час виконання**: ~3.75s

### Покриття коду (Coverage)

- **Загальне покриття проєкту**: 6.11% (багато файлів ще не покрито)
- **ServiceCard.jsx**: 94.55% ⭐
- **services.js**: 58.25%
- **Інші компоненти**: 0% (не протестовані)

---

## Запуск тестів

### Watch mode (автоматичний перезапуск при змінах)

```bash
npm test
```

### Одноразовий запуск

```bash
npx vitest run
```

### З покриттям коду

```bash
npm run test:coverage
```

### UI режим (візуальний інтерфейс)

```bash
npm run test:ui
```

---

## Виявлені проблеми та рішення

### 1. jsdom несумісність з Node v20.15.1

**Проблема**: `ERR_REQUIRE_ESM` при спробі використати jsdom 27.4.0

**Рішення**: Перейшли на happy-dom - легша та сумісна альтернатива

### 2. CSS Modules обфускація

**Проблема**: Класи CSS Modules обфусковані в тестах, неможливо використовувати `querySelector('.className')`

**Рішення**: Використання `getByRole()`, `getByText()`, `getByLabelText()` з aria-labels

### 3. Import помилки

**Проблема**: Неправильні шляхи імпортів (`authSlice` vs `slice.js`)

**Рішення**: Виправлено на правильні шляхи та named exports

### 4. React state updates warnings

**Проблема**: `Warning: An update to ServiceCard inside a test was not wrapped in act(...)`

**Рішення**: Наразі попередження присутнє, але не критичне (тести проходять). Можна обгорнути async операції в `waitFor()` або `act()` для повного усунення.

---

## Наступні кроки

### Рекомендації для розширення покриття:

1. **Додати тести для інших компонентів**:

   - Header, Nav, Footer
   - AuthModals (SignInModal, SignUpModal)
   - ServiceList, ServiceDetail
   - UserCard, UserInfo

2. **Додати тести для Redux slices**:

   - auth operations (login, register, logout)
   - services operations (fetchServices, createService)
   - Reducers та selectors

3. **Додати тести для utils і hooks**:

   - `useGeolocation`
   - `normalizeHttpError`
   - `tokenStorage`

4. **E2E тести** (опціонально):
   - Повний потік: реєстрація → створення сервісу → перегляд → видалення
   - Інструменти: Playwright або Cypress

---

## Корисні команди

```bash
# Очистити кеш тестів
npx vitest run --no-cache

# Запустити тільки один файл
npx vitest services.test.js

# Запустити тести у debug режимі
node --inspect-brk node_modules/.bin/vitest

# Оновити snapshots (якщо використовуються)
npx vitest -u
```

---

## Ресурси

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Accessibility Testing](https://www.w3.org/WAI/test-evaluate/)

---

**Дата створення**: 15 січня 2026  
**Автор**: AI Assistant + Development Team  
**Версія**: 1.0
