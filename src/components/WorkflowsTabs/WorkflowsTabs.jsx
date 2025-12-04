import PropTypes from "prop-types";
import { WorkflowList } from "../WorkflowList/WorkflowList";
import { Button } from "../Button/Button";

import css from "./WorkflowsTabs.module.css";

export const WorkflowsTabs = ({
  user,
  onConnectN8n,
  onExecuteWorkflow,
  onViewWorkflow,
}) => {
  console.log("WorkflowsTabs rendered with user:", user);

  return (
    <div className={css.container}>
      <div className={css.listHeader}>
        <Button>+ Додати новий АІ сценарій</Button>
      </div>
      <WorkflowList
        user={user}
        onConnectN8n={onConnectN8n}
        onExecuteWorkflow={onExecuteWorkflow}
        onViewWorkflow={onViewWorkflow}
      />
    </div>
  );
};

WorkflowsTabs.propTypes = {
  user: PropTypes.shape({
    n8nEnabled: PropTypes.bool,
  }),
  onConnectN8n: PropTypes.func.isRequired,
  onExecuteWorkflow: PropTypes.func.isRequired,
  onViewWorkflow: PropTypes.func.isRequired,
};
