import { useState } from "react";
import { useGeolocation } from "../../hooks/useGeolocation";
import { LocationModal } from "../LocationModal/LocationModal";
import EditIcon from "../../assets/icons/edit.svg?react";
import css from "./LocationDisplay.module.css";

export const LocationDisplay = () => {
  const {
    city,
    country,
    address,
    street,
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
          street: street || "",
        }
      : null;

  const displayText = () => {
    if (loading) return "Визначення...";
    if (error) return "Обрати локацію";

    if (address && !address.includes("Координати:")) {
      return address;
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

    return "Обрати локацію";
  };

  return (
    <>
      <div className={css.location} onClick={handleLocationClick}>
        <span className={css.locationIcon}>
          {loading ? "⏳" : error ? "" : ""}
        </span>
        <span className={css.locationText}>
          {<b>Ваша локація: </b>}
          {displayText()}
        </span>
        <EditIcon className={css.changeIcon} />
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
