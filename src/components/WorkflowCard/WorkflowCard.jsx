import React from "react";
import PropTypes from "prop-types";
import { Typography } from "../Typography/Typography";
import { Button } from "../Button/Button";

import css from "./WorkflowCard.module.css";
import ArrowUpIcon from "../../assets/icons/arrow-up-right.svg?react";
import TrashIcon from "../../assets/icons/trash.svg?react";
import EditIcon from "../../assets/icons/edit.svg?react";

export const WorkflowCard = ({
  workflowId,
  name,
  active,
  tags,
  onExecute,
  onView,
  isMobile,
}) => {
  const handleExecuteClick = (e) => {
    e.stopPropagation();
    onExecute(workflowId);
  };

  const handleViewClick = () => {
    onView(workflowId);
  };

  return (
    <div className={css.workflowCard} onClick={handleViewClick}>
      <div className={css.cardHeader}>
        <div className={css.headerContent}>
          <Typography variant="h4" className={css.workflowName}>
            {name}
          </Typography>
          <div className={css.statusBadge}>
            <span
              className={`${css.statusDot} ${
                active ? css.statusActive : css.statusInactive
              }`}
            />
            <Typography variant="caption" className={css.statusText}>
              {active ? "Active" : "Inactive"}
            </Typography>
          </div>
        </div>
      </div>

      {tags && tags.length > 0 && (
        <div className={css.tagsContainer}>
          {tags.slice(0, 3).map((tag, index) => (
            <span key={index} className={css.tag}>
              {tag.name}
            </span>
          ))}
          {tags.length > 3 && (
            <span className={css.tagMore}>+{tags.length - 3}</span>
          )}
        </div>
      )}

      <div className={css.cardActions}>
        <Button
          variant="uastyle"
          size={isMobile ? "mysmall" : "mysmall"}
          onClick={handleExecuteClick}
          className={css.executeButton}
        >
          {active ? "Deactivate" : "Activate"}
        </Button>

        <button
          type="button"
          className={css.viewButton}
          onClick={handleViewClick}
          aria-label="Edit workflow details"
        >
          <EditIcon className={css.viewIcon} />
        </button>

        <button
          type="button"
          className={css.viewButton}
          onClick={handleViewClick}
          aria-label="Delete workflow"
        >
          <TrashIcon className={css.viewIcon} />
        </button>
      </div>
    </div>
  );
};

WorkflowCard.propTypes = {
  workflowId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  name: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  tags: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
    }),
  ),
  onExecute: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  isMobile: PropTypes.bool,
};

WorkflowCard.defaultProps = {
  tags: [],
  isMobile: false,
};
