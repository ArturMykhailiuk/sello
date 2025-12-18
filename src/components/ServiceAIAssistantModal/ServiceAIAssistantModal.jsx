import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { Modal } from "../Modal/Modal";
import { Button } from "../Button/Button";
import { Typography } from "../Typography/Typography";
import Loader from "../Loader/Loader";
import { DynamicFormField } from "../DynamicFormField/DynamicFormField";
import {
  fetchAITemplates,
  createAIWorkflow,
  updateAIWorkflow,
  selectAITemplates,
  selectAIWorkflowsCreating,
  selectAIWorkflowsUpdating,
  selectAIWorkflowsGenerating,
  generateSystemPrompt,
} from "../../store/aiWorkflows";
import { normalizeHttpError } from "../../utils";

import css from "./ServiceAIAssistantModal.module.css";

export const ServiceAIAssistantModal = ({
  isOpen,
  onClose,
  serviceId,
  onWorkflowCreated,
  editingWorkflow = null, // Якщо передано - режим редагування
}) => {
  const dispatch = useDispatch();
  const templatesRaw = useSelector(selectAITemplates);
  const templates = useMemo(() => templatesRaw || [], [templatesRaw]);
  const isCreating = useSelector(selectAIWorkflowsCreating);
  const isUpdating = useSelector(selectAIWorkflowsUpdating);
  const isGenerating = useSelector(selectAIWorkflowsGenerating);

  const isEditMode = Boolean(editingWorkflow);
  const isSubmitting = isEditMode ? isUpdating : isCreating;

  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Знаходимо вибраний template
  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === Number(selectedTemplateId)),
    [templates, selectedTemplateId],
  );

  useEffect(() => {
    if (isOpen && templates.length === 0) {
      dispatch(fetchAITemplates());
    }
  }, [isOpen, dispatch, templates.length]);

  // Ініціалізація при редагуванні
  useEffect(() => {
    if (editingWorkflow) {
      setSelectedTemplateId(
        String(
          editingWorkflow.aiTemplateId || editingWorkflow.aiTemplate?.id || "",
        ),
      );
    }
  }, [editingWorkflow]);

  // Ініціалізація формових даних з defaultValue або editingWorkflow
  useEffect(() => {
    if (selectedTemplate?.formConfig?.fields) {
      const initialData = {};
      selectedTemplate.formConfig.fields.forEach((field) => {
        if (editingWorkflow && editingWorkflow[field.id] !== undefined) {
          // Якщо режим редагування - використовуємо значення з workflow
          initialData[field.id] = editingWorkflow[field.id];
        } else if (field.defaultValue !== undefined) {
          // Інакше - defaultValue з formConfig
          initialData[field.id] = field.defaultValue;
        }
      });
      setFormData(initialData);
      setErrors({});
    } else {
      // Fallback для старих templates без formConfig
      setFormData({});
      setErrors({});
    }
  }, [selectedTemplate, editingWorkflow]);

  const handleFieldChange = (fieldId, value) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: "" }));
    }
  };

  const handleTemplateChange = async (e) => {
    const newTemplateId = e.target.value;
    setSelectedTemplateId(newTemplateId);

    // If template selected and not in edit mode, trigger prompt generation
    if (newTemplateId && !isEditMode && serviceId) {
      // Find the selected template to get its name
      const template = templates.find((t) => t.id === Number(newTemplateId));
      if (template) {
        try {
          const generatedPrompt = await dispatch(
            generateSystemPrompt({
              assistantType: template.name,
              serviceId: serviceId,
            }),
          ).unwrap();

          // Auto-fill the systemPrompt field if it exists in formConfig
          if (generatedPrompt) {
            setFormData((prev) => ({
              ...prev,
              systemPrompt: generatedPrompt,
            }));
          }
        } catch (error) {
          console.error("Failed to generate system prompt:", error);
          toast.error(
            normalizeHttpError(error).message ||
              "Failed to generate system prompt. You can enter it manually.",
          );
        }
      }
    }
  };

  const validateForm = () => {
    if (!selectedTemplate?.formConfig?.fields) return false;

    const newErrors = {};

    selectedTemplate.formConfig.fields.forEach((field) => {
      const value = formData[field.id];

      if (field.required && (!value || value.toString().trim() === "")) {
        newErrors[field.id] = `${field.label} is required`;
        return;
      }

      if (field.validation && value) {
        const val = field.validation;
        const stringValue = value.toString();

        if (val.minLength && stringValue.length < val.minLength) {
          newErrors[field.id] =
            val.errorMessage || `Minimum length is ${val.minLength}`;
        }
        if (val.maxLength && stringValue.length > val.maxLength) {
          newErrors[field.id] =
            val.errorMessage || `Maximum length is ${val.maxLength}`;
        }
        if (val.min && Number(value) < val.min) {
          newErrors[field.id] =
            val.errorMessage || `Minimum value is ${val.min}`;
        }
        if (val.max && Number(value) > val.max) {
          newErrors[field.id] =
            val.errorMessage || `Maximum value is ${val.max}`;
        }
        // Pattern (regex) validation for fields like telegramToken
        if (val.pattern && !new RegExp(val.pattern).test(stringValue)) {
          newErrors[field.id] = val.errorMessage || `Invalid format`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditMode) {
        // Режим редагування
        const updatedWorkflow = await dispatch(
          updateAIWorkflow({
            id: editingWorkflow.id,
            workflowData: formData, // Тільки динамічні поля (без aiTemplateId)
          }),
        ).unwrap();

        toast.success("AI Assistant updated successfully!");
        handleClose();

        if (onWorkflowCreated && updatedWorkflow) {
          onWorkflowCreated(updatedWorkflow);
        }
      } else {
        // Режим створення
        const newWorkflow = await dispatch(
          createAIWorkflow({
            serviceId,
            workflowData: {
              aiTemplateId: Number(selectedTemplateId),
              ...formData, // Всі динамічні поля
            },
          }),
        ).unwrap();

        toast.success("AI Assistant created successfully!");
        handleClose();

        if (onWorkflowCreated && newWorkflow) {
          onWorkflowCreated(newWorkflow);
        }
      }
    } catch (error) {
      toast.error(
        normalizeHttpError(error).message ||
          `Failed to ${isEditMode ? "update" : "create"} AI assistant`,
      );
    }
  };

  const handleClose = () => {
    setSelectedTemplateId("");
    setFormData({});
    setErrors({});
    onClose();
  };

  const renderForm = () => {
    if (!selectedTemplate?.formConfig?.fields) {
      // Fallback для старих templates без formConfig
      return (
        <div className={css.field}>
          <Typography variant="body" className={css.error}>
            Спочатку оберіть тип асистента
          </Typography>
        </div>
      );
    }

    const config = selectedTemplate.formConfig;

    return config.fields.map((field) => (
      <DynamicFormField
        key={field.id}
        field={field}
        value={formData[field.id] || ""}
        onChange={handleFieldChange}
        error={errors[field.id]}
        disabled={isSubmitting}
      />
    ));
  };

  return (
    <Modal isOpen={isOpen} closeModal={handleClose}>
      <form onSubmit={handleSubmit} className={css.form}>
        <Typography variant="h2" className={css.title}>
          {isEditMode ? "Редагувати АІ Асистента" : "Додайте АІ Асистента"}
        </Typography>

        {/* Вибір типу асистента */}
        <div className={css.field}>
          <label htmlFor="templateSelect" className={css.label}>
            Тип ассистента
          </label>
          <select
            id="templateSelect"
            value={selectedTemplateId}
            onChange={handleTemplateChange}
            className={css.customSelect}
            disabled={isSubmitting || isEditMode || isGenerating} // Заблоковано при редагуванні або генерації
          >
            <option value="">Виберіть тип</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
          {isGenerating && (
            <div className={css.generatingText}>
              <Loader />
              <span>Генерація системного промпту...</span>
            </div>
          )}
        </div>

        {/* Динамічні поля форми */}
        {renderForm()}

        {/* Кнопки */}
        <div className={css.actions}>
          <Button
            type="button"
            variant="uastyleGrayBorder"
            size="mysmall"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Скасувати
          </Button>
          <Button
            type="submit"
            variant="uastyleGrayBorder"
            size="mysmall"
            disabled={isSubmitting || !selectedTemplateId}
          >
            {isSubmitting ? (
              <>
                <div style={{ transform: "scale(0.5)" }}>
                  <Loader />
                </div>
              </>
            ) : isEditMode ? (
              "Оновити"
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
  editingWorkflow: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    systemPrompt: PropTypes.string,
    aiTemplateId: PropTypes.number,
    aiTemplate: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }),
  }),
};
