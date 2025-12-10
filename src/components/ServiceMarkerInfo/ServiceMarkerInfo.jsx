import { useNavigate } from "react-router";
import { Button } from "../Button/Button";
import styles from "./ServiceMarkerInfo.module.css";

export const ServiceMarkerInfo = ({ service }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/service/${service.id}`);
  };

  return (
    <div className={styles.container}>
      {service.thumb && (
        <img
          src={service.thumb}
          alt={service.title}
          className={styles.thumbnail}
        />
      )}
      <div className={styles.content}>
        <h3 className={styles.title}>{service.title}</h3>
        {service.category && (
          <p className={styles.category}>{service.category.name}</p>
        )}
        {service.time && <p className={styles.time}>⏱️ {service.time} хв</p>}
        {service.areas?.[0] && (
          <p className={styles.location}>
            📍 {service.areas[0].city || service.areas[0].name}
          </p>
        )}
        <Button onClick={handleViewDetails} className={styles.button}>
          Детальніше
        </Button>
      </div>
    </div>
  );
};
