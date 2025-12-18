import { useNavigate } from "react-router-dom";
import styles from "./ServicePreview.module.css";
import ArrowUpRightIcon from "../../assets/icons/arrow-up-right.svg?react";
import TrashIcon from "../../assets/icons/trash.svg?react";
import { TabKey } from "../../constants/common";
import { normalizeHttpError, normalizeImagePath } from "../../utils";
import { Typography } from "../Typography/Typography";
import { ButtonIcon } from "../ButtonIcon/ButtonIcon";
import ArrowIncreaseIcon from "../../assets/icons/arrow-increase.svg?react";
import EditIcon from "../../assets/icons/edit.svg?react";
import toast from "react-hot-toast";
import {
  deleteServiceById,
  removeFavoriteService,
} from "../../services/services";

/**
 * @param {object} props
 * @param {object} props.service
 * @param {string} props.tab — TabKey.SERVICES | TabKey.FAVORITES
 * @param {boolean} props.isMyProfile
 * @param {Function} props.onDelete — callback to remove the item from UI after deletion
 */
export const ServicePreview = ({ service, tab, isMyProfile, onDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      let msg = "";
      if (tab === TabKey.SERVICES) {
        const data = await deleteServiceById(service.id);
        msg = data?.message ?? "Service removed successfully";
      } else {
        const data = await removeFavoriteService(service.id);
        msg = data?.message ?? "Service removed from favorites successfully";
      }

      if (msg) {
        toast.success(msg);
      }
      onDelete();
    } catch (err) {
      const error = normalizeHttpError(err);
      toast.error(error.message);
    }
  };

  return (
    <div className={styles.card}>
      <img
        src={normalizeImagePath(service.thumb)}
        alt={service.title}
        className={styles.image}
      />
      <div className={styles.content}>
        <Typography
          variant="h4"
          textColor="uablue"
          truncate="true"
          lineClamp={1}
        >
          {service.title}
        </Typography>
        <Typography
          className={styles.description}
          variant="body"
          textColor="uablue"
          truncate="true"
          lineClamp={2}
        >
          {service.description}
        </Typography>
        <div className={styles.actions}>
          <ButtonIcon
            variant="light"
            size="medium"
            icon={<ArrowIncreaseIcon width={18} height={18} />}
            onClick={() => navigate(`/service/${service.id}`)}
          />

          {isMyProfile && (
            <ButtonIcon
              variant="light"
              size="medium"
              icon={<EditIcon width={18} height={18} />}
              onClick={handleDelete}
            />
          )}

          {isMyProfile && (
            <ButtonIcon
              variant="light"
              size="medium"
              icon={<TrashIcon width={18} height={18} />}
              onClick={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
};
