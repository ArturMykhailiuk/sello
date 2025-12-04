import { createAsyncThunk } from "@reduxjs/toolkit";

import * as aiWorkflowsService from "../../services/aiWorkflows";
import { normalizeHttpError } from "../../utils";

/**
 * Fetch all AI templates
 */
export const fetchAITemplates = createAsyncThunk(
  "aiWorkflows/fetchTemplates",
  async (_, { rejectWithValue }) => {
    try {
      const templates = await aiWorkflowsService.getAITemplates();
      return templates;
    } catch (error) {
      return rejectWithValue(normalizeHttpError(error));
    }
  },
);

/**
 * Fetch AI workflows for a specific service
 */
export const fetchServiceAIWorkflows = createAsyncThunk(
  "aiWorkflows/fetchServiceWorkflows",
  async (serviceId, { rejectWithValue }) => {
    try {
      const workflows = await aiWorkflowsService.getServiceAIWorkflows(
        serviceId,
      );
      return workflows;
    } catch (error) {
      return rejectWithValue(normalizeHttpError(error));
    }
  },
);

/**
 * Create a new AI workflow
 */
export const createAIWorkflow = createAsyncThunk(
  "aiWorkflows/create",
  async ({ serviceId, workflowData }, { rejectWithValue }) => {
    try {
      const workflow = await aiWorkflowsService.createAIWorkflow(
        serviceId,
        workflowData,
      );
      return workflow;
    } catch (error) {
      return rejectWithValue(normalizeHttpError(error));
    }
  },
);

/**
 * Delete an AI workflow
 */
export const deleteAIWorkflow = createAsyncThunk(
  "aiWorkflows/delete",
  async (id, { rejectWithValue }) => {
    try {
      await aiWorkflowsService.deleteAIWorkflow(id);
      return id;
    } catch (error) {
      return rejectWithValue(normalizeHttpError(error));
    }
  },
);

/**
 * Toggle AI workflow active status
 */
export const toggleAIWorkflow = createAsyncThunk(
  "aiWorkflows/toggle",
  async (id, { rejectWithValue }) => {
    try {
      const workflow = await aiWorkflowsService.toggleAIWorkflow(id);
      return workflow;
    } catch (error) {
      return rejectWithValue(normalizeHttpError(error));
    }
  },
);

/**
 * Fetch all AI workflows for current user's services
 */
export const fetchUserAIWorkflows = createAsyncThunk(
  "aiWorkflows/fetchUserWorkflows",
  async (_, { rejectWithValue }) => {
    try {
      const workflows = await aiWorkflowsService.getUserAIWorkflows();
      return workflows;
    } catch (error) {
      return rejectWithValue(normalizeHttpError(error));
    }
  },
);
