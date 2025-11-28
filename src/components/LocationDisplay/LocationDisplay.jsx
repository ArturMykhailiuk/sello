import { useState } from "react";
import { useGeolocation } from "../../hooks/useGeolocation";
import { LocationModal } from "../LocationModal/LocationModal";
import css from "./LocationDisplay.module.css";

export const LocationDisplay = ({ isHome }) => {
  const {
    city,
    country,
    address,
    latitude,
    longitude,
    loading,
    error,
    setUserLocation,
  } = useGeolocation();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLocationClick = () => {
    setIsModalOpen(true);
  };

  const handleLocationSave = (newLocation) => {
    setUserLocation(newLocation);
    setIsModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const currentLocation =
    latitude && longitude
      ? {
          lat: latitude,
          lng: longitude,
          address: address,
          city: city,
          country: country,
        }
      : null;

  const displayText = () => {
    if (loading) return "Визначення...";
    if (error) return "Вибрати локацію";

    // Пріоритет відображення: адреса > місто з країною > країна > координати
    if (address && !address.includes("Координати:")) {
      // Скорочуємо довгі адреси для header
      return address.length > 30 ? address.substring(0, 27) + "..." : address;
    }

    if (city && country) {
      return `${city}, ${country}`;
    }

    if (country) {
      return country;
    }

    if (latitude && longitude) {
      return `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
    }

    return "Вибрати локацію";
  };

  return (
    <>
      <div
        className={`${css.location} ${isHome ? css.whiteLocation : ""}`}
        onClick={handleLocationClick}
      >
        <span className={css.locationIcon}>
          {loading ? "⏳" : error ? "❗" : ""}
        </span>
        <span className={css.locationText}>{displayText()}</span>
        {/* <span className={css.changeIcon}>📝</span> */}
      </div>

      <LocationModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleLocationSave}
        currentLocation={currentLocation}
      />
    </>
  );
};
