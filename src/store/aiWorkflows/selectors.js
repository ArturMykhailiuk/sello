export const selectAIWorkflows = (state) => state.aiWorkflows.items;
export const selectUserAIWorkflows = (state) => state.aiWorkflows.userItems;
export const selectAITemplates = (state) => state.aiWorkflows.templates;
export const selectAIWorkflowsLoading = (state) => state.aiWorkflows.isLoading;
export const selectUserAIWorkflowsLoading = (state) =>
  state.aiWorkflows.isLoading;
export const selectAIWorkflowsCreating = (state) =>
  state.aiWorkflows.isCreating;
export const selectAIWorkflowsUpdating = (state) =>
  state.aiWorkflows.isUpdating;
export const selectAIWorkflowsDeleting = (state) =>
  state.aiWorkflows.isDeleting;
export const selectAIWorkflowsToggling = (state) =>
  state.aiWorkflows.isToggling;
export const selectAIWorkflowsGenerating = (state) =>
  state.aiWorkflows.isGenerating;
export const selectAIWorkflowsError = (state) => state.aiWorkflows.error;
