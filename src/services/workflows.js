import api from "./api";

/**
 * Check n8n status and auto-connect if user exists in n8n
 */
export const checkN8nStatus = async () => {
  const response = await api.get("/workflows/status");
  return response.data.data;
};

/**
 * Connect user's n8n account (creates n8n user)
 */
export const connectN8n = async () => {
  const response = await api.post("/workflows/connect");
  return response.data;
};

/**
 * Get all workflows for the current user
 */
export const getWorkflows = async () => {
  const response = await api.get("/workflows");
  return response.data.data.workflows;
};

/**
 * Get workflow by ID
 */
export const getWorkflowById = async (workflowId) => {
  const response = await api.get(`/workflows/${workflowId}`);
  return response.data.data.workflow;
};

/**
 * Execute a workflow
 * @param {string} workflowId - Workflow ID
 * @param {Object} data - Data to pass to workflow execution
 */
export const executeWorkflow = async (workflowId, data = {}) => {
  const response = await api.post(`/workflows/${workflowId}/execute`, { data });
  return response.data;
};

/**
 * Get execution history for a workflow
 * @param {string} workflowId - Workflow ID
 * @param {Object} params - Query parameters (limit, status)
 */
export const getExecutions = async (workflowId, params = {}) => {
  const response = await api.get(`/workflows/${workflowId}/executions`, {
    params,
  });
  return response.data.data.executions;
};

/**
 * Get execution status by ID
 */
export const getExecutionStatus = async (executionId) => {
  const response = await api.get(`/workflows/executions/${executionId}`);
  return response.data.data.execution;
};
