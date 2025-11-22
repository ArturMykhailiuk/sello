import { createAsyncThunk } from "@reduxjs/toolkit";

import api from "../../services/api";
import { normalizeHttpError } from "../../utils";

export const getAllItems = createAsyncThunk(
  "items/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/items?limit=1000");
      return data.data.items;
    } catch (error) {
      return rejectWithValue({ error: normalizeHttpError(error) });
    }
  },
);
