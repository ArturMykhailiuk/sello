import { createPortal } from "react-dom";
import { useLoadScript } from "@react-google-maps/api";
import { ServicesMap } from "../ServicesMap/ServicesMap";
import styles from "./ServicesMapModal.module.css";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const libraries = ["places", "marker"];

export const ServicesMapModal = ({ isOpen, onClose, services }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  if (!isOpen) return null;

  // Підрахунок всіх локацій (не послуг)
  const totalLocations = services.reduce((count, service) => {
    if (service.areas && Array.isArray(service.areas)) {
      const validAreas = service.areas.filter(
        (area) =>
          area?.latitude &&
          area?.longitude &&
          area.latitude !== "undefined" &&
          area.longitude !== "undefined" &&
          !isNaN(parseFloat(area.latitude)) &&
          !isNaN(parseFloat(area.longitude)),
      );
      return count + validAreas.length;
    }
    return count;
  }, 0);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Карта послуг</h2>
          <div className={styles.info}>
            <span className={styles.count}>
              Знайдено: {totalLocations}{" "}
              {totalLocations === 1
                ? "локація"
                : totalLocations < 5
                ? "локації"
                : "локацій"}
            </span>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.mapWrapper}>
          {loadError && (
            <div className={styles.error}>
              Помилка завантаження карти. Спробуйте оновити сторінку.
            </div>
          )}
          {!isLoaded && (
            <div className={styles.loading}>Завантаження карти...</div>
          )}
          {isLoaded && <ServicesMap services={services} />}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
