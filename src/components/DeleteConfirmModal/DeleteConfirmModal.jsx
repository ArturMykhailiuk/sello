import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "../Button/Button";
import { Typography } from "../Typography/Typography";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { DEFAULT_ERROR_MESSAGE } from "../../constants/common";

import css from "./DeleteConfirmModal.module.css";

export const DeleteConfirmModal = ({ onClose, onConfirm, serviceTitle }) => {
  const [disabled, setDisabled] = useState(false);

  const breakpoint = useBreakpoint();
  const isMobile = ["mobile", "small-mobile"].includes(breakpoint);

  const handleDelete = async () => {
    try {
      setDisabled(true);
      await onConfirm();
    } catch (error) {
      toast.error(error?.message ?? DEFAULT_ERROR_MESSAGE);
    } finally {
      setDisabled(false);
    }
  };

  return (
    <div className={css.container}>
      <Typography className={css.title} variant="h2">
        {isMobile
          ? "Видалити послугу?"
          : "Ви впевнені, що хочете видалити послугу?"}
      </Typography>

      <Typography className={css.text} variant="body">
        Послуга "{serviceTitle}" буде видалена назавжди. Цю дію не можна буде
        скасувати.
      </Typography>

      <Button
        className={`${css.button} ${css.buttonMB}`}
        type="button"
        variant="blue"
        size="medium"
        disabled={disabled}
        bordered
        onClick={handleDelete}
      >
        {disabled ? "Видалення..." : "Видалити"}
      </Button>

      <Button
        className={css.button}
        type="button"
        variant="light"
        size="medium"
        bordered
        onClick={onClose}
      >
        Скасувати
      </Button>
    </div>
  );
};
