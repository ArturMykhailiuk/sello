import { useNavigate } from "react-router";
import { Button } from "../Button/Button";
import { ButtonIcon } from "../ButtonIcon/ButtonIcon";
import ArrowIncrease from "../../assets/icons/arrow-increase.svg?react";
import HeartIcon from "../../assets/icons/heart.svg?react";
import { normalizeImagePath } from "../../utils";
import styles from "./ServiceMarkerInfo.module.css";

export const ServiceMarkerInfo = ({ service, area }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/service/${service.id}`);
  };

  return (
    <div className={styles.container}>
      {service.thumb && (
        <img
          src={normalizeImagePath(service.thumb)}
          alt={service.title}
          className={styles.thumbnail}
        />
      )}
      <div className={styles.content}>
        <h3 className={styles.title}>{service.title}</h3>
        {service.category && (
          <p className={styles.category}>{service.category.name}</p>
        )}
        {area && (
          <p className={styles.location}>
            {area.formattedAddress || area.city || area.name}
          </p>
        )}
        <div className={styles.serviceIcons}>
          <ButtonIcon
            variant="light"
            size="verysmall"
            // onClick={handleFavoriteClick}
            // disabled={updating}
            icon={<HeartIcon />}
          />
          <ButtonIcon
            variant="light"
            size="verysmall"
            onClick={handleViewDetails}
            // disabled={updating}
            icon={<ArrowIncrease />}
          />
        </div>
      </div>
    </div>
  );
};
