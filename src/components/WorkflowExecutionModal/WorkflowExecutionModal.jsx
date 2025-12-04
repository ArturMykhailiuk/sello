import { useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

import { Button } from "../Button/Button";
import { Typography } from "../Typography/Typography";
import { Input } from "../Input/Input";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { executeWorkflow } from "../../store/workflows";
import { DEFAULT_ERROR_MESSAGE } from "../../constants/common";

import css from "./WorkflowExecutionModal.module.css";
import Loader from "../Loader/Loader";

export const WorkflowExecutionModal = ({
  workflowId,
  workflowName,
  onClose,
}) => {
  const dispatch = useDispatch();
  const [disabled, setDisabled] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [parameters, setParameters] = useState("");

  const breakpoint = useBreakpoint();
  const isMobile = ["mobile", "small-mobile"].includes(breakpoint);

  const handleExecute = async () => {
    try {
      setDisabled(true);
      setExecuting(true);
      setExecutionResult(null);

      let data = {};
      if (parameters.trim()) {
        try {
          data = JSON.parse(parameters);
        } catch {
          toast.error("Invalid JSON format for parameters");
          return;
        }
      }

      const result = await dispatch(
        executeWorkflow({ workflowId, data }),
      ).unwrap();

      setExecutionResult(result);
      toast.success("Workflow executed successfully!");
    } catch (error) {
      const errorMessage =
        error?.message || error?.error?.message || DEFAULT_ERROR_MESSAGE;
      toast.error(errorMessage);
      setExecutionResult({ error: errorMessage });
    } finally {
      setDisabled(false);
      setExecuting(false);
    }
  };

  const handleClose = () => {
    if (!executing) {
      onClose();
    }
  };

  return (
    <div className={css.container}>
      <Typography className={css.title} variant="h2">
        {isMobile ? "Execute" : `Execute Workflow`}
      </Typography>

      <Typography className={css.workflowName} variant="h4">
        {workflowName}
      </Typography>

      {!executionResult && (
        <>
          <div className={css.inputSection}>
            <Typography variant="body" className={css.label}>
              Parameters (optional JSON):
            </Typography>
            <textarea
              className={css.textarea}
              placeholder='{"key": "value"}'
              value={parameters}
              onChange={(e) => setParameters(e.target.value)}
              rows={6}
              disabled={disabled}
            />
            <Typography variant="caption" className={css.hint}>
              Enter parameters as JSON. Leave empty if workflow doesn't require
              parameters.
            </Typography>
          </div>

          {executing && (
            <div className={css.loadingContainer}>
              <Loader />
              <Typography variant="body" className={css.loadingText}>
                Executing workflow...
              </Typography>
            </div>
          )}

          <Button
            className={`${css.button} ${css.buttonMB}`}
            type="button"
            variant="primary"
            size="medium"
            disabled={disabled}
            onClick={handleExecute}
          >
            {executing ? "Executing..." : "Execute Workflow"}
          </Button>

          <Button
            className={css.button}
            type="button"
            variant="light"
            size="medium"
            bordered
            onClick={handleClose}
            disabled={executing}
          >
            Cancel
          </Button>
        </>
      )}

      {executionResult && (
        <>
          <div className={css.resultSection}>
            <Typography variant="h4" className={css.resultTitle}>
              {executionResult.error ? "Execution Failed" : "Execution Result"}
            </Typography>
            <div className={css.resultContent}>
              <pre className={css.resultPre}>
                {JSON.stringify(executionResult, null, 2)}
              </pre>
            </div>
          </div>

          <Button
            className={css.button}
            type="button"
            variant="primary"
            size="medium"
            onClick={handleClose}
          >
            Close
          </Button>
        </>
      )}
    </div>
  );
};
