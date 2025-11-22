import { createSlice } from "@reduxjs/toolkit";

import { getAllItems } from "./operations";

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const itemsSlice = createSlice({
  name: "items",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(getAllItems.fulfilled, (state, { payload }) => {
        state.items = payload;
        state.loading = false;
      })
      .addCase(getAllItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllItems.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload?.error;
      }),
});

export const itemsReducer = itemsSlice.reducer;
