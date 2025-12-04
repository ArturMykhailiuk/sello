import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { WorkflowCard } from "../WorkflowCard/WorkflowCard";
import { Button } from "../Button/Button";
import { Typography } from "../Typography/Typography";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { selectWorkflows, selectWorkflowsLoading } from "../../store/workflows";
import { fetchWorkflows } from "../../store/workflows/operations";

import css from "./WorkflowList.module.css";
import Loader from "../Loader/Loader";

export const WorkflowList = ({
  user,
  onConnectN8n,
  onExecuteWorkflow,
  onViewWorkflow,
}) => {
  const dispatch = useDispatch();
  const workflows = useSelector(selectWorkflows);
  const loading = useSelector(selectWorkflowsLoading);
  const breakpoint = useBreakpoint({ tablet: 540 });
  const isMobile = ["mobile", "small-mobile"].includes(breakpoint);

  const hasN8nEnabled = user?.n8nEnabled;

  // Load workflows when n8n is enabled
  useEffect(() => {
    if (hasN8nEnabled) {
      dispatch(fetchWorkflows());
    }
  }, [hasN8nEnabled, dispatch]);

  if (loading) {
    return (
      <div className={css.loaderContainer}>
        <Loader />
      </div>
    );
  }

  if (!hasN8nEnabled) {
    return (
      <div className={css.emptyState}>
        <div className={css.emptyContent}>
          <Typography variant="h2" className={css.emptyTitle}>
            Connect to n8n
          </Typography>
          <Typography variant="body" className={css.emptyDescription}>
            To start creating and managing workflows, you need to connect your
            n8n account. This will create a dedicated workspace for your
            automation workflows.
          </Typography>
          <Button
            variant="primary"
            size="large"
            onClick={onConnectN8n}
            className={css.connectButton}
          >
            Connect n8n Account
          </Button>
        </div>
      </div>
    );
  }

  if (!workflows || workflows.length === 0) {
    return (
      <div className={css.emptyState}>
        <div className={css.emptyContent}>
          <Typography variant="h2" className={css.emptyTitle}>
            No Workflows Yet
          </Typography>
          <Typography variant="body" className={css.emptyDescription}>
            You haven't created any workflows yet. Open the n8n editor to start
            building your first automation workflow.
          </Typography>
          <Button
            variant="primary"
            size="large"
            onClick={() => window.open("https://sell-o.shop/n8n", "_blank")}
            className={css.connectButton}
          >
            Open n8n Editor
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={css.workflowList}>
      <div className={css.workflowsGrid}>
        {workflows.map((workflow) => (
          <WorkflowCard
            key={workflow.id}
            workflowId={workflow.id}
            name={workflow.name}
            active={workflow.active}
            tags={workflow.tags}
            onExecute={onExecuteWorkflow}
            onView={onViewWorkflow}
            isMobile={isMobile}
          />
        ))}
      </div>
    </div>
  );
};

WorkflowList.propTypes = {
  user: PropTypes.shape({
    n8nEnabled: PropTypes.bool,
  }),
  onConnectN8n: PropTypes.func.isRequired,
  onExecuteWorkflow: PropTypes.func.isRequired,
  onViewWorkflow: PropTypes.func.isRequired,
};

WorkflowList.defaultProps = {
  user: null,
};
