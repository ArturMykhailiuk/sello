export const selectWorkflows = (state) => state.workflows.workflows;

export const selectSelectedWorkflow = (state) =>
  state.workflows.selectedWorkflow;

export const selectExecutions = (state) => state.workflows.executions;

export const selectWorkflowsLoading = (state) => state.workflows.loading;

export const selectWorkflowsError = (state) => state.workflows.error;
