import React, { useState } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { ServiceAIWorkflowCard } from "../ServiceAIWorkflowCard/ServiceAIWorkflowCard";
import { Button } from "../Button/Button";
import { Typography } from "../Typography/Typography";
import Loader from "../Loader/Loader";
import {
  deleteAIWorkflow,
  toggleAIWorkflow,
  selectAIWorkflowsLoading,
  selectAIWorkflowsDeleting,
  selectAIWorkflowsToggling,
} from "../../store/aiWorkflows";
import { normalizeHttpError } from "../../utils";

import css from "./ServiceAIWorkflowsList.module.css";

export const ServiceAIWorkflowsList = ({ workflows, onAddNew, onEdit }) => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectAIWorkflowsLoading);
  const isDeleting = useSelector(selectAIWorkflowsDeleting);
  const isToggling = useSelector(selectAIWorkflowsToggling);
  const [activeId, setActiveId] = useState(null);

  const handleToggle = async (id) => {
    setActiveId(id);
    try {
      await dispatch(toggleAIWorkflow(id)).unwrap();
      toast.success("AI workflow status updated");
    } catch (error) {
      toast.error(
        normalizeHttpError(error).message || "Failed to toggle workflow",
      );
    } finally {
      setActiveId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this AI assistant?")) {
      return;
    }

    setActiveId(id);
    try {
      await dispatch(deleteAIWorkflow(id)).unwrap();
      toast.success("AI assistant deleted successfully");
    } catch (error) {
      toast.error(
        normalizeHttpError(error).message || "Failed to delete workflow",
      );
    } finally {
      setActiveId(null);
    }
  };

  if (isLoading) {
    return (
      <div className={css.loaderContainer}>
        <Loader />
      </div>
    );
  }

  return (
    <div className={css.container}>
      <div className={css.header}>
        <Typography variant="h2" textColor="uablue">
          ШІ Асистенти
        </Typography>
        <Button variant="uatransparent" size="medium" onClick={onAddNew}>
          + Додати ШІ Асистента
        </Button>
      </div>

      {workflows.length === 0 ? (
        <div className={css.emptyState}>
          <Typography variant="h3" className={css.emptyTitle}>
            У Вас ще немає ШІ Асистентів
          </Typography>
          <Typography variant="body1" className={css.emptyText}>
            Додайте свого першого ШІ Асистента, щоб автоматизувати взаємодію з
            клієнтами та покращити їхній досвід.
          </Typography>
        </div>
      ) : (
        <div className={css.grid}>
          {workflows.map((workflow) => (
            <ServiceAIWorkflowCard
              key={workflow.id}
              workflow={workflow}
              onEdit={onEdit}
              onToggle={handleToggle}
              onDelete={handleDelete}
              isToggling={isToggling && activeId === workflow.id}
              isDeleting={isDeleting && activeId === workflow.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

ServiceAIWorkflowsList.propTypes = {
  serviceId: PropTypes.number.isRequired,
  workflows: PropTypes.arrayOf(
    PropTypes.shape({
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
    }),
  ).isRequired,
  onAddNew: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};
