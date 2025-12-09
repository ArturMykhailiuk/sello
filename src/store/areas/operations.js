import { createAsyncThunk } from "@reduxjs/toolkit";

import api from "../../services/api";
import { normalizeHttpError } from "../../utils";

export const getAllAreas = createAsyncThunk(
  "areas/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/areas?limit=1000");
      return data.data.areas;
    } catch (error) {
      return rejectWithValue({ error: normalizeHttpError(error) });
    }
  },
);

export const createOrUpdateArea = createAsyncThunk(
  "areas/createOrUpdate",
  async (locationData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/areas", locationData);
      return data.data.area;
    } catch (error) {
      return rejectWithValue({ error: normalizeHttpError(error) });
    }
  },
);
