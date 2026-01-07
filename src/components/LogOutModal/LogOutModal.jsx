import { useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

import { Button } from "../Button/Button";
import { Typography } from "../Typography/Typography";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { logout } from "../../store/auth";
import { DEFAULT_ERROR_MESSAGE } from "../../constants/common";

import css from "./LogOutModal.module.css";

export const LogOutModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const [disabled, setDisabled] = useState(false);

  const breakpoint = useBreakpoint();
  const isMobile = ["mobile", "small-mobile"].includes(breakpoint);

  const handleLogout = async () => {
    try {
      setDisabled(true);
      await dispatch(logout()).unwrap();
    } catch (error) {
      toast.error(error.error?.message ?? DEFAULT_ERROR_MESSAGE);
    } finally {
      setDisabled(false);
    }
  };

  return (
    <div className={css.container}>
      <Typography className={css.title} variant="h2">
        {isMobile ? "Вийти?" : "Ви дійсно хочете вийти?"}
      </Typography>

      <Typography className={css.text} variant="body">
        Ви завжди можете повернутись у будь-який час.
      </Typography>

      <Button
        className={`${css.button} ${css.buttonMB}`}
        type="button"
        variant="blue"
        size="medium"
        disabled={disabled}
        bordered
        onClick={handleLogout}
      >
        Вийти
      </Button>

      <Button
        className={css.button}
        type="button"
        variant="blue"
        size="medium"
        bordered
        onClick={onClose}
      >
        Відмінити
      </Button>
    </div>
  );
};
