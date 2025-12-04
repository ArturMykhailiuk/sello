import { createAsyncThunk } from "@reduxjs/toolkit";

import * as workflowsService from "../../services/workflows";
import { normalizeHttpError } from "../../utils";

export const connectN8n = createAsyncThunk(
  "workflows/connectN8n",
  async (_, { rejectWithValue }) => {
    try {
      const data = await workflowsService.connectN8n();
      return data;
    } catch (error) {
      return rejectWithValue(normalizeHttpError(error));
    }
  },
);

export const fetchWorkflows = createAsyncThunk(
  "workflows/fetchWorkflows",
  async (_, { rejectWithValue }) => {
    try {
      const workflows = await workflowsService.getWorkflows();
      return workflows;
    } catch (error) {
      return rejectWithValue(normalizeHttpError(error));
    }
  },
);

export const fetchWorkflowById = createAsyncThunk(
  "workflows/fetchWorkflowById",
  async (workflowId, { rejectWithValue }) => {
    try {
      const workflow = await workflowsService.getWorkflowById(workflowId);
      return workflow;
    } catch (error) {
      return rejectWithValue(normalizeHttpError(error));
    }
  },
);

export const executeWorkflow = createAsyncThunk(
  "workflows/executeWorkflow",
  async ({ workflowId, data }, { rejectWithValue }) => {
    try {
      const result = await workflowsService.executeWorkflow(workflowId, data);
      return result;
    } catch (error) {
      return rejectWithValue(normalizeHttpError(error));
    }
  },
);

export const fetchExecutions = createAsyncThunk(
  "workflows/fetchExecutions",
  async ({ workflowId, params }, { rejectWithValue }) => {
    try {
      const executions = await workflowsService.getExecutions(
        workflowId,
        params,
      );
      return executions;
    } catch (error) {
      return rejectWithValue(normalizeHttpError(error));
    }
  },
);
