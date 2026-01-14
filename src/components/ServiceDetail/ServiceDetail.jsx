import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

import { Typography } from "../Typography/Typography";
import { Button } from "../Button/Button";
import { ButtonIcon } from "../ButtonIcon/ButtonIcon";
import EditIcon from "../../assets/icons/edit.svg?react";
import TrashIcon from "../../assets/icons/trash.svg?react";
import HeartIcon from "../../assets/icons/heart.svg?react";
import { Modal } from "../Modal/Modal";
import { DeleteConfirmModal } from "../DeleteConfirmModal/DeleteConfirmModal";
import { openSignIn, selectIsLoggedIn } from "../../store/auth";
import { DEFAULT_ERROR_MESSAGE } from "../../constants/common";
import { appClearSessionAction } from "../../store/utils";
import { normalizeHttpError } from "../../utils";
import {
  addFavoriteService,
  removeFavoriteService,
  deleteServiceById,
} from "../../services/services";

import styles from "./ServiceDetail.module.css";

export const ServiceDetail = ({
  serviceId,
  textColor,
  instructions,
  isFavorite,
  updateFavoriteStatus,
  isOwner,
  serviceTitle,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const [updating, setUpdating] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleFavoriteClick = async () => {
    if (!isLoggedIn) {
      dispatch(openSignIn());
      return;
    }

    try {
      setUpdating(true);
      let message;

      if (isFavorite) {
        const data = await removeFavoriteService(serviceId);
        message = data.message;
        updateFavoriteStatus(false);
      } else {
        const data = await addFavoriteService(serviceId);
        message = data.message;
        updateFavoriteStatus(true);
      }

      toast.success(message);
    } catch (error) {
      const { message, status } = normalizeHttpError(error);
      toast.error(message ?? DEFAULT_ERROR_MESSAGE);
      if (status === 401) dispatch(appClearSessionAction());
    } finally {
      setUpdating(false);
    }
  };

  const handleEditClick = () => {
    navigate(`/service/${serviceId}/edit`);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteServiceById(serviceId);
      toast.success("Послугу успішно видалено");
      navigate("/");
    } catch (error) {
      const { message, status } = normalizeHttpError(error);
      toast.error(message ?? DEFAULT_ERROR_MESSAGE);
      if (status === 401) dispatch(appClearSessionAction());
      throw error;
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div>
      <Typography variant="h5" textColor={textColor} className={styles.title}>
        Детальний опис (інструкції):
      </Typography>

      <Typography variant="body" textColor={textColor} className={styles.text}>
        {instructions}
      </Typography>
      <div className={styles.buttonGroup}>
        <ButtonIcon
          variant={isFavorite ? "yellow" : "light"}
          size="medium"
          icon={<HeartIcon width={18} height={18} />}
          onClick={handleFavoriteClick}
          disabled={updating}
        />
        {/* <Button
          onClick={handleFavoriteClick}
          type="button"
          variant="blue"
          size="medium"
          bordered
          disabled={updating}
        >
          {isFavorite ? "Видалити з вподобань" : "Додати до вподобань"}
        </Button> */}
        {isOwner && (
          <>
            {/* <Button
              onClick={handleEditClick}
              type="button"
              variant="blue"
              size="medium"
              bordered
              disabled={updating}
            >
              Змінити
            </Button>
            <Button
              onClick={handleDeleteClick}
              type="button"
              variant="blue"
              size="medium"
              bordered
              disabled={updating}
            >
              Видалити
            </Button> */}
            <ButtonIcon
              variant="light"
              size="medium"
              icon={<EditIcon width={18} height={18} />}
              onClick={handleEditClick}
              disabled={updating}
            />
            <ButtonIcon
              variant="light"
              size="medium"
              icon={<TrashIcon width={18} height={18} />}
              onClick={handleDeleteClick}
              disabled={updating}
            />
          </>
        )}
      </div>

      {isDeleteModalOpen && (
        <Modal
          isOpen={isDeleteModalOpen}
          closeModal={() => setIsDeleteModalOpen(false)}
        >
          <DeleteConfirmModal
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleConfirmDelete}
            serviceTitle={serviceTitle}
          />
        </Modal>
      )}
    </div>
  );
};
