import React from "react";
import PropTypes from "prop-types";
import { Button } from "../Button/Button";
import { Typography } from "../Typography/Typography";
import css from "./ServiceAIWorkflowCard.module.css";
import EditIcon from "../../assets/icons/edit.svg?react";
import OnOffIcon from "../../assets/icons/on-off.svg?react";
import TrashIcon from "../../assets/icons/trash.svg?react";
import { ButtonIcon } from "../ButtonIcon/ButtonIcon";
import Loader from "../Loader/Loader";

export const ServiceAIWorkflowCard = ({
  workflow,
  onEdit,
  onToggle,
  onDelete,
  isToggling,
  isDeleting,
}) => {
  const { id, name, isActive, aiTemplate, createdAt } = workflow;

  // const truncateText = (text, maxLength = 100) => {
  //   if (text.length <= maxLength) return text;
  //   return text.substring(0, maxLength) + "...";
  // };

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
      </div>

      <div className={css.content}>
        <div>
          <Typography variant="body2" className={css.templateType}>
            {aiTemplate?.name || "AI Assistant"}
          </Typography>
          {aiTemplate?.name === "Telegram AI Bot" && (
            <Typography variant="body2" className={css.templateType}>
              @{workflow.telegramBotUsername}
            </Typography>
          )}
        </div>
        <div className={css.dateContainer}>
          <Typography variant="caption" className={css.date}>
            Created: {formatDate(createdAt)}
          </Typography>
        </div>
      </div>

      <div className={css.actions}>
        <ButtonIcon
          variant="aicard"
          size="small"
          onClick={() => onEdit(workflow)}
          icon={<EditIcon />}
        ></ButtonIcon>
        <ButtonIcon
          variant={isActive ? "aicardOn" : "aicardOff"}
          size="small"
          onClick={() => onToggle(id)}
          disabled={isToggling}
          icon={
            isToggling ? (
              <div style={{ transform: "scale(0.5)" }}>
                <Loader />
              </div>
            ) : (
              <OnOffIcon />
            )
          }
        >
          {isToggling && <Loader />}
        </ButtonIcon>
        <ButtonIcon
          variant="aicard"
          size="small"
          onClick={() => onDelete(id)}
          disabled={isDeleting}
          icon={
            isDeleting ? (
              <div style={{ transform: "scale(0.5)" }}>
                <Loader />
              </div>
            ) : (
              <TrashIcon />
            )
          }
        ></ButtonIcon>
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
  onEdit: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isToggling: PropTypes.bool,
  isDeleting: PropTypes.bool,
};

ServiceAIWorkflowCard.defaultProps = {
  isToggling: false,
  isDeleting: false,
};
