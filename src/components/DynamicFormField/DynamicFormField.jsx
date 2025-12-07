import React from "react";
import PropTypes from "prop-types";
import { Input } from "../Input/Input";
import css from "./DynamicFormField.module.css";

export const DynamicFormField = ({
  field,
  value,
  onChange,
  error,
  disabled,
}) => {
  const handleChange = (e) => {
    const newValue =
      field.type === "checkbox" ? e.target.checked : e.target.value;
    onChange(field.id, newValue);
  };

  switch (field.type) {
    case "text":
    case "number":
      return (
        <div className={css.field}>
          <label htmlFor={field.id} className={css.label}>
            {field.label}
            {field.required && <span className={css.required}>*</span>}
          </label>
          <Input
            id={field.id}
            name={field.id}
            type={field.type}
            value={value || ""}
            onChange={handleChange}
            placeholder={field.placeholder}
            error={error}
            disabled={disabled}
            required={field.required}
            variant="uastyle"
          />
          {field.hint && !error && (
            <span className={css.hint}>{field.hint}</span>
          )}
        </div>
      );

    case "textarea":
      return (
        <div className={css.field}>
          <label htmlFor={field.id} className={css.label}>
            {field.label}
            {field.required && <span className={css.required}>*</span>}
          </label>
          <textarea
            id={field.id}
            name={field.id}
            value={value || ""}
            onChange={handleChange}
            placeholder={field.placeholder}
            rows={field.rows || 4}
            disabled={disabled}
            required={field.required}
            className={css.textarea}
          />
          {error && <span className={css.error}>{error}</span>}
          {field.hint && !error && (
            <span className={css.hint}>{field.hint}</span>
          )}
        </div>
      );

    case "select":
      return (
        <div className={css.field}>
          <label htmlFor={field.id} className={css.label}>
            {field.label}
            {field.required && <span className={css.required}>*</span>}
          </label>
          <select
            id={field.id}
            name={field.id}
            value={value || field.defaultValue || ""}
            onChange={handleChange}
            disabled={disabled}
            required={field.required}
            className={css.select}
          >
            <option value="">Виберіть опцію</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && <span className={css.error}>{error}</span>}
          {field.hint && !error && (
            <span className={css.hint}>{field.hint}</span>
          )}
        </div>
      );

    case "checkbox":
      return (
        <div className={css.fieldCheckbox}>
          <label className={css.checkboxLabel}>
            <input
              type="checkbox"
              id={field.id}
              name={field.id}
              checked={value ?? field.defaultValue ?? false}
              onChange={handleChange}
              disabled={disabled}
              className={css.checkbox}
            />
            <span>{field.label}</span>
          </label>
          {field.hint && <span className={css.hint}>{field.hint}</span>}
        </div>
      );

    default:
      return null;
  }
};

DynamicFormField.propTypes = {
  field: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(["text", "number", "textarea", "select", "checkbox"])
      .isRequired,
    label: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    rows: PropTypes.number,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
      }),
    ),
    defaultValue: PropTypes.any,
    hint: PropTypes.string,
    validation: PropTypes.object,
  }).isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  disabled: PropTypes.bool,
};
