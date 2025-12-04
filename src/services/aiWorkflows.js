import api from "./api.js";

/**
 * Get all available AI templates
 * @returns {Promise<Array>} List of AI templates
 */
export const getAITemplates = async () => {
  const response = await api.get("/ai-templates");
  return response.data.templates;
};

/**
 * Get all AI workflows for a specific service
 * @param {number} serviceId - Service ID
 * @returns {Promise<Array>} List of AI workflows
 */
export const getServiceAIWorkflows = async (serviceId) => {
  const response = await api.get(`/services/${serviceId}/ai-workflows`);
  return response.data.workflows;
};

/**
 * Create a new AI workflow for a service
 * @param {number} serviceId - Service ID
 * @param {Object} workflowData - Workflow data
 * @param {number} workflowData.aiTemplateId - AI template ID
 * @param {string} workflowData.name - Workflow name
 * @param {string} workflowData.systemPrompt - System prompt for AI
 * @returns {Promise<Object>} Created workflow
 */
export const createAIWorkflow = async (serviceId, workflowData) => {
  const response = await api.post(
    `/services/${serviceId}/ai-workflows`,
    workflowData,
  );
  return response.data.workflow;
};

/**
 * Delete an AI workflow
 * @param {number} id - Workflow ID
 * @returns {Promise<Object>} Delete response
 */
export const deleteAIWorkflow = async (id) => {
  const response = await api.delete(`/ai-workflows/${id}`);
  return response.data;
};

/**
 * Toggle AI workflow active status
 * @param {number} id - Workflow ID
 * @returns {Promise<Object>} Updated workflow
 */
export const toggleAIWorkflow = async (id) => {
  const response = await api.patch(`/ai-workflows/${id}/toggle`);
  return response.data.workflow;
};

/**
 * Get all AI workflows for current user's services
 * @returns {Promise<Array>} List of AI workflows across all user's services
 */
export const getUserAIWorkflows = async () => {
  const response = await api.get("/users/me/ai-workflows");
  return response.data.workflows;
};

/**
 * Send a message to AI workflow chat
 * @param {string} webhookUrl - Webhook URL of the AI workflow
 * @param {string} message - User message
 * @param {string} sessionId - Chat session ID
 * @returns {Promise<Object>} AI response
 */
export const sendMessageToAI = async (webhookUrl, message, sessionId) => {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "sendMessage",
      sessionId,
      chatInput: message,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send message to AI");
  }

  const data = await response.json();
  return data;
};
