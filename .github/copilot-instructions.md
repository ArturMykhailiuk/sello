# SELL-O Frontend - AI Agent Instructions

## Project Overview

React 19 + Vite frontend for SELL-O service-sharing platform. Uses Redux Toolkit for state, React Router v7 for navigation, Google Maps integration, and n8n chat widget for AI assistants. Styled with CSS Modules and Ukrainian flag color scheme (`--ua-blue`, `--ua-yellow`).

## Architecture & Data Flow

**State Management** (Redux Toolkit): `src/store/`

- Slices: `auth`, `areas`, `categories`, `ingredients`, `items` (services), `workflows`, `aiWorkflows`
- API calls in slice `extraReducers` via `createAsyncThunk`
- `appClearSessionMiddleware` - clears state on 401 responses
- Selectors use `createSelector` for memoization

**Routing** (React Router v7): `src/App.jsx`

- Public routes: `/`, `/about` (outside `<PrivateRoute>`)
- Protected routes: wrapped in `<PrivateRoute>` component
- Lazy loading: `const Page = lazy(() => import("./pages/Page/Page.jsx"))`
- Navigation via `useNavigate()`, route matching via `useMatch("/path")`

**Component Structure**:

- `src/components/` - reusable UI (Button, Input, Modal, etc.)
- `src/pages/` - route-level components
- CSS Modules: `Component.module.css` imported as `styles`
- Use `clsx()` for conditional classes: `clsx(css.button, isActive && css.active)`

**API Integration**: `src/services/` (Axios instances)

- Base URL: `import.meta.env.VITE_API_BASE_URL`
- Interceptors add auth token from Redux state
- Error handling throws with response data for Redux to catch

## Critical Patterns

### CSS & Styling

```css
/* Ukrainian color scheme - use CSS variables */
--ua-blue: #0d73ba;
--ua-yellow: #f7c400;
--ua-main: #fff;
--text-primary: #1a1a1a;

/* CSS Modules - component-scoped classes */
.container {
  ...;
}
.homeHeader {
  background: transparent;
} /* conditional styling */
```

### Form Handling (Formik + Yup)

```jsx
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

const schema = Yup.object({
  name: Yup.string().required("Required"),
});

<Formik initialValues={{}} validationSchema={schema} onSubmit={handleSubmit}>
  <Form>
    <Field name="name" />
    <ErrorMessage name="name" component="div" />
  </Form>
</Formik>;
```

### Redux Async Patterns

```javascript
// In slice file
export const fetchItems = createAsyncThunk(
  "items/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const data = await itemsAPI.getAll(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// In component
const dispatch = useDispatch();
const items = useSelector(selectItems);

useEffect(() => {
  dispatch(fetchItems({ page: 1 }));
}, [dispatch]);
```

### Google Maps Integration

```jsx
import { Wrapper } from "@googlemaps/react-wrapper";

// API key from env
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

<Wrapper apiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
  <MapComponent />
</Wrapper>;
```

### N8N Chat Widget

```jsx
import { createChat } from "@n8n/chat";

useEffect(() => {
  createChat({
    webhookUrl: workflow.webhookUrl,
    target: "#n8n-chat",
  });
}, [workflow.webhookUrl]);
```

### Image Upload Pattern

```jsx
// In components like ImageUpload
<input type="file" accept="image/*" onChange={handleChange} />;

// Form data construction
const formData = new FormData();
formData.append("image", file);
formData.append("title", values.title);

// API call
await servicesAPI.create(formData); // Axios auto-sets Content-Type
```

## Developer Workflows

**Development**:

```bash
npm run dev          # Vite dev server (localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run storybook    # Component library (localhost:6006)
npm run lint         # ESLint check
```

**Environment Setup**:

```bash
# .env file (required)
VITE_API_BASE_URL=http://localhost:3000/api
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

**Component Development**:

1. Create `Component.jsx` + `Component.module.css` in `src/components/ComponentName/`
2. Export from `src/components/index.js` for cleaner imports
3. Add Storybook story if reusable: `Component.stories.jsx`

## Project-Specific Conventions

### File Naming

- Components: PascalCase (`UserProfile.jsx`)
- CSS Modules: `Component.module.css`
- Utils/hooks: camelCase (`useGeolocation.js`)
- Pages: PascalCase in `pages/PageName/PageName.jsx`

### Import Order

```javascript
// 1. External libraries
import { useState } from "react";
import { useDispatch } from "react-redux";

// 2. Internal components/hooks
import { Button } from "../Button/Button";
import { useAuth } from "../../hooks/useAuth";

// 3. Services/utils
import { servicesAPI } from "../../services/servicesAPI";

// 4. Styles (last)
import styles from "./Component.module.css";
```

### SVG Icons

- Stored in `src/assets/icons/`
- Imported as React components: `import Logo from "../../assets/icons/logo.svg?react"`
- Used as: `<Logo className={css.icon} />`
- Can style via `fill` or `stroke` CSS properties

### Modal Patterns

```jsx
import { createPortal } from "react-dom";

// Always portal to document.body
return createPortal(
  <div className={styles.overlay} onClick={onClose}>
    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  </div>,
  document.body,
);
```

### Responsive Design

```css
/* Mobile-first approach */
.header {
  padding: 24px 0;
}

@media screen and (min-width: 768px) {
  .header {
    padding: 36px;
  }
}

@media screen and (min-width: 1440px) {
  .header {
    padding: 40px;
  }
}
```

## Common Gotchas

1. **React Router v7**: Use `import { useNavigate } from "react-router"` (not `react-router-dom`)
2. **CSS Modules**: Class names are scoped - use `styles.className`, not string literals
3. **Environment Variables**: Must prefix with `VITE_` to be accessible via `import.meta.env`
4. **SVG Imports**: Add `?react` suffix to import as component, not URL
5. **Redux Selectors**: Always memoize with `createSelector` if deriving/filtering data
6. **Form Validation**: Yup schemas defined outside component to avoid recreation
7. **Geolocation**: Use `useGeolocation` hook - handles permissions, storage, and error states
8. **Protected Routes**: Wrap in `<PrivateRoute>` component, not manual redirect logic

## Key Files & Directories

- `src/App.jsx` - Route configuration, lazy loading, layout structure
- `src/store/index.js` - Redux store setup, all slices registered here
- `src/services/` - API clients (axios instances with interceptors)
- `src/hooks/useAuth.js` - Auth state shortcuts (isLoggedIn, user data)
- `src/components/PrivateRoute/` - Route protection HOC
- `src/constants/` - API endpoints, validation patterns, app-wide constants
- `vite.config.js` - Vite configuration, plugins, dev server settings

## Integration with Backend

- API base URL configured via `VITE_API_BASE_URL` environment variable
- All endpoints prefixed with `/api` (e.g., `/api/services`, `/api/auth/login`)
- Authentication via JWT token stored in Redux (`auth.token`)
- Token auto-attached to requests via Axios interceptor
- Backend API docs: [Swagger](https://mykytaolenykov.com/sello/api/docs/#/)
- Related backend repo: `../sello-api/` (Node.js/Express/Sequelize/PostgreSQL)

## Testing & Quality

- **Linting**: ESLint with React/JSX rules
- **Storybook**: Visual component testing and documentation
- **Manual Testing**: Use Redux DevTools extension for state inspection
- **API Testing**: Backend has Swagger UI for endpoint testing

## Design System

- Figma: [Design File](https://www.figma.com/design/TKl7kDNvwtz62RsuWNnQ5E/Sello)
- Color scheme: Ukrainian flag colors throughout
- Typography: System fonts with fallbacks
- Spacing: 4px base unit (8px, 12px, 16px, 20px, 24px, etc.)
