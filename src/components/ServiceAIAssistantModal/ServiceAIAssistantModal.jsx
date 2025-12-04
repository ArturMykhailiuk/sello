import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { Modal } from "../Modal/Modal";
import { Input } from "../Input/Input";
import { Button } from "../Button/Button";
import { Typography } from "../Typography/Typography";
import Loader from "../Loader/Loader";
import {
  fetchAITemplates,
  createAIWorkflow,
  selectAITemplates,
  selectAIWorkflowsCreating,
} from "../../store/aiWorkflows";
import { normalizeHttpError } from "../../utils";

import css from "./ServiceAIAssistantModal.module.css";

export const ServiceAIAssistantModal = ({
  isOpen,
  onClose,
  serviceId,
  onWorkflowCreated,
}) => {
  const dispatch = useDispatch();
  const templatesRaw = useSelector(selectAITemplates);
  const templates = useMemo(() => templatesRaw || [], [templatesRaw]);
  const isCreating = useSelector(selectAIWorkflowsCreating);

  const [formData, setFormData] = useState({
    aiTemplateId: "",
    name: "",
    systemPrompt: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && templates.length === 0) {
      dispatch(fetchAITemplates());
    }
  }, [isOpen, dispatch, templates.length]);

  useEffect(() => {
    if (isOpen && templates.length > 0 && !formData.aiTemplateId) {
      setFormData((prev) => ({
        ...prev,
        aiTemplateId: templates[0].id,
      }));
    }
  }, [isOpen, templates, formData.aiTemplateId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.aiTemplateId) {
      newErrors.aiTemplateId = "Please select a template";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }
    if (!formData.systemPrompt.trim()) {
      newErrors.systemPrompt = "System prompt is required";
    } else if (formData.systemPrompt.trim().length < 10) {
      newErrors.systemPrompt = "System prompt must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const newWorkflow = await dispatch(
        createAIWorkflow({
          serviceId,
          workflowData: {
            aiTemplateId: Number(formData.aiTemplateId),
            name: formData.name.trim(),
            systemPrompt: formData.systemPrompt.trim(),
          },
        }),
      ).unwrap();

      toast.success("AI Assistant created successfully!");
      handleClose();

      // Автоматично відкриваємо чат з новоствореним workflow
      if (onWorkflowCreated && newWorkflow) {
        onWorkflowCreated(newWorkflow);
      }
    } catch (error) {
      toast.error(
        normalizeHttpError(error).message || "Failed to create AI assistant",
      );
    }
  };

  const handleClose = () => {
    setFormData({
      aiTemplateId: "",
      name: "",
      systemPrompt: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} closeModal={handleClose}>
      <form onSubmit={handleSubmit} className={css.form}>
        <Typography variant="h2" className={css.title}>
          Додайте АІ Асистента
        </Typography>

        <div className={css.field}>
          <label htmlFor="aiTemplateId" className={css.label}>
            Тип ассистента
          </label>
          <select
            id="aiTemplateId"
            name="aiTemplateId"
            value={formData.aiTemplateId}
            onChange={handleChange}
            className={css.customSelect}
            disabled={isCreating}
          >
            <option value="">Виберіть шаблон</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
          {errors.aiTemplateId && (
            <span className={css.error}>{errors.aiTemplateId}</span>
          )}
        </div>

        <div className={css.field}>
          <label htmlFor="inputAItemplateName" className={css.label}>
            Назва ассистента
          </label>
          <Input
            id="inputAItemplateName"
            variant="uastyle"
            label="Назва ассистента"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="наприклад, Асистент підтримки клієнтів"
            error={errors.name}
            disabled={isCreating}
            required
          />
        </div>

        <div className={css.field}>
          <label htmlFor="systemPrompt" className={css.label}>
            Системний промпт
          </label>
          <textarea
            id="systemPrompt"
            name="systemPrompt"
            value={formData.systemPrompt}
            onChange={handleChange}
            className={css.textarea}
            placeholder="Визначте роль і поведінку штучного інтелекту.
                        Приклад: Ви — корисний асистент служби підтримки для маркетплейсу локальних послуг.
                        Допомагайте клієнтам знаходити відповідних постачальників послуг, відповідайте на запитання про послуги та надавайте дружню підтримку."
            rows={6}
            disabled={isCreating}
            required
          />
          {errors.systemPrompt && (
            <span className={css.error}>{errors.systemPrompt}</span>
          )}
          <Typography variant="caption" className={css.hint}>
            The system prompt defines how your AI assistant will behave and
            respond to users.
          </Typography>
        </div>

        <div className={css.actions}>
          <Button
            type="button"
            variant="uastyleGrayBorder"
            size="mysmall"
            onClick={handleClose}
            disabled={isCreating}
          >
            Скасувати
          </Button>
          <Button
            type="submit"
            variant="uastyleGrayBorder"
            size="mysmall"
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Loader /> Creating...
              </>
            ) : (
              "Створити"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

ServiceAIAssistantModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  serviceId: PropTypes.number.isRequired,
  onWorkflowCreated: PropTypes.func,
};
