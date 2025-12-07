import { createSlice } from "@reduxjs/toolkit";

import {
  fetchAITemplates,
  fetchServiceAIWorkflows,
  createAIWorkflow,
  updateAIWorkflow,
  deleteAIWorkflow,
  toggleAIWorkflow,
  fetchUserAIWorkflows,
  generateSystemPrompt,
} from "./operations";

const initialState = {
  items: [],
  userItems: [],
  templates: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isToggling: false,
  isGenerating: false,
  error: null,
};

const aiWorkflowsSlice = createSlice({
  name: "aiWorkflows",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetWorkflows: (state) => {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) =>
    builder
      // Fetch AI Templates
      .addCase(fetchAITemplates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAITemplates.fulfilled, (state, { payload }) => {
        state.templates = payload;
        state.isLoading = false;
      })
      .addCase(fetchAITemplates.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      // Fetch Service AI Workflows
      .addCase(fetchServiceAIWorkflows.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServiceAIWorkflows.fulfilled, (state, { payload }) => {
        state.items = payload;
        state.isLoading = false;
      })
      .addCase(fetchServiceAIWorkflows.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      // Create AI Workflow
      .addCase(createAIWorkflow.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createAIWorkflow.fulfilled, (state, { payload }) => {
        state.items.push(payload);
        state.isCreating = false;
      })
      .addCase(createAIWorkflow.rejected, (state, { payload }) => {
        state.isCreating = false;
        state.error = payload;
      })
      // Delete AI Workflow
      .addCase(deleteAIWorkflow.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteAIWorkflow.fulfilled, (state, { payload }) => {
        state.items = state.items.filter((item) => item.id !== payload);
        state.isDeleting = false;
      })
      .addCase(deleteAIWorkflow.rejected, (state, { payload }) => {
        state.isDeleting = false;
        state.error = payload;
      })
      // Update AI Workflow
      .addCase(updateAIWorkflow.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateAIWorkflow.fulfilled, (state, { payload }) => {
        const index = state.items.findIndex((item) => item.id === payload.id);
        if (index !== -1) {
          state.items[index] = payload;
        }
        state.isUpdating = false;
      })
      .addCase(updateAIWorkflow.rejected, (state, { payload }) => {
        state.isUpdating = false;
        state.error = payload;
      })
      // Toggle AI Workflow
      .addCase(toggleAIWorkflow.pending, (state) => {
        state.isToggling = true;
        state.error = null;
      })
      .addCase(toggleAIWorkflow.fulfilled, (state, { payload }) => {
        const index = state.items.findIndex((item) => item.id === payload.id);
        if (index !== -1) {
          state.items[index] = payload;
        }
        state.isToggling = false;
      })
      .addCase(toggleAIWorkflow.rejected, (state, { payload }) => {
        state.isToggling = false;
        state.error = payload;
      })
      // Fetch User AI Workflows
      .addCase(fetchUserAIWorkflows.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserAIWorkflows.fulfilled, (state, { payload }) => {
        state.userItems = payload;
        state.isLoading = false;
      })
      .addCase(fetchUserAIWorkflows.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      // Generate System Prompt
      .addCase(generateSystemPrompt.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(generateSystemPrompt.fulfilled, (state) => {
        state.isGenerating = false;
      })
      .addCase(generateSystemPrompt.rejected, (state, { payload }) => {
        state.isGenerating = false;
        state.error = payload;
      }),
});

export const { clearError, resetWorkflows } = aiWorkflowsSlice.actions;
export const aiWorkflowsReducer = aiWorkflowsSlice.reducer;
