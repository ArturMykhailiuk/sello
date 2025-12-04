import { createSlice } from "@reduxjs/toolkit";

import {
  connectN8n,
  fetchWorkflows,
  fetchWorkflowById,
  executeWorkflow,
  fetchExecutions,
} from "./operations";

const initialState = {
  workflows: [],
  selectedWorkflow: null,
  executions: [],
  loading: false,
  error: null,
};

const workflowsSlice = createSlice({
  name: "workflows",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearSelectedWorkflow(state) {
      state.selectedWorkflow = null;
    },
    clearExecutions(state) {
      state.executions = [];
    },
  },
  extraReducers: (builder) =>
    builder
      // Connect n8n
      .addCase(connectN8n.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(connectN8n.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(connectN8n.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Fetch workflows
      .addCase(fetchWorkflows.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkflows.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.workflows = payload;
      })
      .addCase(fetchWorkflows.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Fetch workflow by ID
      .addCase(fetchWorkflowById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkflowById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.selectedWorkflow = payload;
      })
      .addCase(fetchWorkflowById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Execute workflow
      .addCase(executeWorkflow.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(executeWorkflow.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(executeWorkflow.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Fetch executions
      .addCase(fetchExecutions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExecutions.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.executions = payload;
      })
      .addCase(fetchExecutions.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      }),
});

export const { clearError, clearSelectedWorkflow, clearExecutions } =
  workflowsSlice.actions;

export const workflowsReducer = workflowsSlice.reducer;
