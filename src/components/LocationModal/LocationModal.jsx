import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "../Button/Button";
import { LocationPicker } from "../LocationPicker/LocationPicker";
import styles from "./LocationModal.module.css";

const detectBrowser = () => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes("Edg")) return "edge";
  if (userAgent.includes("Chrome")) return "chrome";
  if (userAgent.includes("Firefox")) return "firefox";
  if (userAgent.includes("Safari") && !userAgent.includes("Chrome"))
    return "safari";
  return "chrome"; // Дефолт
};

export const LocationModal = ({ isOpen, onClose, onSave, currentLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(currentLocation);
  const [mapLoadError, setMapLoadError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [browser] = useState(detectBrowser());

  // Оновлюємо selectedLocation при відкритті модалки або зміні currentLocation
  useEffect(() => {
    if (isOpen) {
      setSelectedLocation(currentLocation);
      setMapLoadError(false);
    }
  }, [isOpen, currentLocation]);

  const handleLocationSelect = (location) => {
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

  const handleRetryGeolocation = () => {
    setIsRetrying(true);
    setMapLoadError(false);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = {
            lat: latitude,
            lng: longitude,
            address: "Визначення адреси...",
            city: "",
            country: "",
            street: "",
          };
          setSelectedLocation(newLocation);
          setIsRetrying(false);
          setMapLoadError(false);
        },
        () => {
          setIsRetrying(false);
          setMapLoadError(true);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    } else {
      setIsRetrying(false);
      setMapLoadError(true);
    }
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

        {!mapLoadError && (
          <p className={styles.subtitle}>
            Натисніть на карту або використайте поле пошуку вище для вибору
            локації
          </p>
        )}

        {mapLoadError && (
          <div className={styles.geolocationHint}>
            <p className={styles.hintTitle}>💡 Як увімкнути геолокацію:</p>
            {browser === "chrome" && (
              <ul className={styles.hintList}>
                <li>
                  <strong>Chrome:</strong> Натисніть на іконку замка 🔒 →
                  Дозволи сайту → Місцезнаходження → Дозволити
                </li>
              </ul>
            )}
            {browser === "edge" && (
              <ul className={styles.hintList}>
                <li>
                  <strong>Edge:</strong> Натисніть на іконку замка 🔒 → Дозволи
                  сайту → Місцезнаходження → Дозволити
                </li>
              </ul>
            )}
            {browser === "firefox" && (
              <ul className={styles.hintList}>
                <li>
                  <strong>Firefox:</strong> Натисніть на іконку щита 🛡️ →
                  Дозволи → Місцезнаходження → Дозволити
                </li>
              </ul>
            )}
            {browser === "safari" && (
              <ul className={styles.hintList}>
                <li>
                  <strong>Safari:</strong> Safari → Налаштування для цього
                  веб-сайту → Місцезнаходження → Дозволити
                </li>
              </ul>
            )}
            <div className={styles.retryButtonWrapper}>
              <Button
                variant="outline"
                onClick={handleRetryGeolocation}
                disabled={isRetrying}
              >
                {isRetrying ? "Запитуємо геолокацію..." : "Спробувати знову"}
              </Button>
            </div>
          </div>
        )}

        <div className={styles.mapWrapper}>
          <LocationPicker
            onLocationSelect={handleLocationSelect}
            initialLocation={currentLocation}
            onMapError={() => setMapLoadError(true)}
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
