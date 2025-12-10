import { Button } from "../Button/Button";
import { Typography } from "../Typography/Typography";
import { ButtonIcon } from "../ButtonIcon/ButtonIcon";
import TrashIcon from "../../assets/icons/trash.svg?react";
import EditIcon from "../../assets/icons/edit.svg?react";
import PlusIcon from "../../assets/icons/plus.svg?react";
import styles from "./LocationsList.module.css";

export const LocationsList = ({ locations = [], onAdd, onEdit, onRemove }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Typography variant="h4">Локації на карті</Typography>
        <Button
          type="button"
          variant="blue"
          size="mysmall"
          icon={<PlusIcon />}
          onClick={onAdd}
        >
          Додати локацію
        </Button>
      </div>

      {locations.length === 0 ? (
        <div className={styles.empty}>
          <Typography variant="body" textColor="gray">
            Локації ще не додані. Натисніть "Додати локацію" щоб додати першу.
          </Typography>
        </div>
      ) : (
        <div className={styles.list}>
          {locations.map((location, index) => (
            <div key={index} className={styles.locationItem}>
              <div className={styles.locationInfo}>
                <Typography variant="body" className={styles.locationAddress}>
                  📍 {location.address || location.city || "Локація"}
                </Typography>
                {location.city && location.address !== location.city && (
                  <Typography variant="bodyS" textColor="gray">
                    {location.city}
                    {location.country && `, ${location.country}`}
                  </Typography>
                )}
              </div>
              <div className={styles.actions}>
                <ButtonIcon
                  icon={<EditIcon />}
                  variant="ghost"
                  onClick={() => onEdit(index, location)}
                  title="Редагувати локацію"
                />
                <ButtonIcon
                  icon={<TrashIcon />}
                  variant="ghost"
                  onClick={() => onRemove(index)}
                  title="Видалити локацію"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
