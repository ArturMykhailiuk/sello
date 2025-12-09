import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "../Button/Button";
import { LocationPicker } from "../LocationPicker/LocationPicker";
import styles from "./LocationModal.module.css";

export const LocationModal = ({ isOpen, onClose, onSave, currentLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(currentLocation);

  // Оновлюємо selectedLocation при відкритті модалки або зміні currentLocation
  useEffect(() => {
    if (isOpen) {
      setSelectedLocation(currentLocation);
    }
  }, [isOpen, currentLocation]);

  const handleLocationSelect = (location) => {
    console.log("LocationModal received location:", location); // Дебаг
    setSelectedLocation(location);
  };

  const handleSave = () => {
    if (selectedLocation) {
      onSave(selectedLocation);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedLocation(currentLocation);
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className={styles.modalOverlay} onClick={handleCancel}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.title}>Виберіть вашу локацію</h2>
          <button className={styles.closeButton} onClick={handleCancel}>
            ×
          </button>
        </div>

        <p className={styles.subtitle}>
          Натисніть на карту, щоб вибрати локацію, або використайте кнопку "Моя
          локація"
        </p>

        <div className={styles.mapWrapper}>
          <LocationPicker
            onLocationSelect={handleLocationSelect}
            initialLocation={currentLocation}
          />
        </div>

        {selectedLocation && (
          <div className={styles.selectedInfo}>
            <h3>Вибрана локація:</h3>
            <p className={styles.locationName}>
              {selectedLocation.address || "Невідома локація"}
            </p>
            <p className={styles.coordinates}>
              Координати: {selectedLocation.lat.toFixed(6)},{" "}
              {selectedLocation.lng.toFixed(6)}
            </p>
          </div>
        )}

        <div className={styles.actions}>
          <Button variant="outline" onClick={handleCancel}>
            Скасувати
          </Button>
          <Button onClick={handleSave} disabled={!selectedLocation}>
            Зберегти
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
