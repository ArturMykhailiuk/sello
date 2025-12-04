import { useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

import { Button } from "../Button/Button";
import { Typography } from "../Typography/Typography";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { connectN8n } from "../../store/workflows";
import { getCurrentUser } from "../../store/auth";
import { DEFAULT_ERROR_MESSAGE } from "../../constants/common";

import css from "./N8nConnectionModal.module.css";

export const N8nConnectionModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const [disabled, setDisabled] = useState(false);

  const breakpoint = useBreakpoint();
  const isMobile = ["mobile", "small-mobile"].includes(breakpoint);

  const handleConnect = async () => {
    try {
      setDisabled(true);
      await dispatch(connectN8n()).unwrap();

      // Refresh user data to get updated n8nEnabled status
      await dispatch(getCurrentUser()).unwrap();

      toast.success("n8n account successfully created and connected!");
      onClose();
    } catch (error) {
      const errorMessage =
        error?.message || error?.error?.message || DEFAULT_ERROR_MESSAGE;
      toast.error(errorMessage);
    } finally {
      setDisabled(false);
    }
  };

  return (
    <div className={css.container}>
      <Typography className={css.title} variant="h2">
        {isMobile ? "Connect n8n" : "Connect to n8n"}
      </Typography>

      <Typography className={css.text} variant="body">
        This will create a dedicated n8n account for you to manage your
        automation workflows. You'll be able to create, edit, and execute
        workflows directly from your profile.
      </Typography>

      <div className={css.features}>
        <Typography variant="body" className={css.feature}>
          ✓ Personal workflow workspace
        </Typography>
        <Typography variant="body" className={css.feature}>
          ✓ Secure API access
        </Typography>
        <Typography variant="body" className={css.feature}>
          ✓ Execute workflows on demand
        </Typography>
      </div>

      <Button
        className={`${css.button} ${css.buttonMB}`}
        type="button"
        variant="primary"
        size="medium"
        disabled={disabled}
        onClick={handleConnect}
      >
        {disabled ? "Connecting..." : "Create n8n Account"}
      </Button>

      <Button
        className={css.button}
        type="button"
        variant="light"
        size="medium"
        bordered
        onClick={onClose}
        disabled={disabled}
      >
        Cancel
      </Button>
    </div>
  );
};
