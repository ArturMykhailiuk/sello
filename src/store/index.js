import { configureStore } from "@reduxjs/toolkit";

import { areasReducer } from "./areas";
import { authReducer } from "./auth";
import { categoriesReducer } from "./categories";
import { ingredientsReducer } from "./ingredients";
import { itemsReducer } from "./services/slice";
import { workflowsReducer } from "./workflows";
import { aiWorkflowsReducer } from "./aiWorkflows";
import { appClearSessionMiddleware } from "./utils";

export const store = configureStore({
  reducer: {
    areas: areasReducer,
    auth: authReducer,
    categories: categoriesReducer,
    ingredients: ingredientsReducer,
    items: itemsReducer,
    workflows: workflowsReducer,
    aiWorkflows: aiWorkflowsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(appClearSessionMiddleware),
});
