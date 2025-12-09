import { createSlice } from "@reduxjs/toolkit";

import { getAllAreas, createOrUpdateArea } from "./operations";

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const areasSlice = createSlice({
  name: "areas",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(getAllAreas.fulfilled, (state, { payload }) => {
        state.items = payload;
        state.loading = false;
      })
      .addCase(getAllAreas.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllAreas.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload?.error;
      })
      .addCase(createOrUpdateArea.fulfilled, (state, { payload }) => {
        // Додаємо нову area або оновлюємо існуючу
        const index = state.items.findIndex((item) => item.id === payload.id);
        if (index !== -1) {
          state.items[index] = payload;
        } else {
          state.items.push(payload);
        }
        state.loading = false;
      })
      .addCase(createOrUpdateArea.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrUpdateArea.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload?.error;
      }),
});

export const areasReducer = areasSlice.reducer;
