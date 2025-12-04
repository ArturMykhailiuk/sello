import React from "react";
import PropTypes from "prop-types";
import { Button } from "../Button/Button";
import { Typography } from "../Typography/Typography";
import css from "./ServiceAIWorkflowCard.module.css";

export const ServiceAIWorkflowCard = ({
  workflow,
  onChat,
  onToggle,
  onDelete,
  isToggling,
  isDeleting,
}) => {
  const { id, name, systemPrompt, isActive, aiTemplate, createdAt } = workflow;

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className={css.card}>
      <div className={css.header}>
        <div className={css.titleRow}>
          <Typography variant="h3" className={css.name}>
            {name}
          </Typography>
          <span
            className={`${css.badge} ${isActive ? css.active : css.inactive}`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <Typography variant="body2" className={css.templateType}>
          {aiTemplate?.name || "AI Assistant"}
        </Typography>
      </div>

      <div className={css.content}>
        <Typography variant="body2" className={css.label}>
          System Prompt:
        </Typography>
        <Typography variant="body1" className={css.prompt}>
          {truncateText(systemPrompt)}
        </Typography>
        <Typography variant="caption" className={css.date}>
          Created: {formatDate(createdAt)}
        </Typography>
      </div>

      <div className={css.actions}>
        <Button variant="primary" size="small" onClick={() => onChat(workflow)}>
          Змінити
        </Button>
        <Button
          variant="secondary"
          size="small"
          onClick={() => onToggle(id)}
          disabled={isToggling}
        >
          {isToggling ? "..." : isActive ? "Деактивувати" : "Активувати"}
        </Button>
        <Button
          variant="danger"
          size="small"
          onClick={() => onDelete(id)}
          disabled={isDeleting}
        >
          {isDeleting ? "..." : "Видалити"}
        </Button>
      </div>
    </div>
  );
};

ServiceAIWorkflowCard.propTypes = {
  workflow: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    systemPrompt: PropTypes.string.isRequired,
    isActive: PropTypes.bool.isRequired,
    webhookUrl: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
    aiTemplate: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }),
  }).isRequired,
  onChat: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isToggling: PropTypes.bool,
  isDeleting: PropTypes.bool,
};

ServiceAIWorkflowCard.defaultProps = {
  isToggling: false,
  isDeleting: false,
};
