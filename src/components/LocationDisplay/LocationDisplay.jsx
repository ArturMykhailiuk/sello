import { useGeolocation } from "../../hooks/useGeolocation";
import css from "./LocationDisplay.module.css";

export const LocationDisplay = ({ isHome }) => {
  const { city, country, loading, error } = useGeolocation();

  // Діагностика - завжди показуємо щось для тестування
  console.log("LocationDisplay:", { city, country, loading, error });

  if (loading) {
    return (
      <div className={`${css.location} ${isHome ? css.whiteLocation : ""}`}>
        <span className={css.locationIcon}>📍</span>
        <span>Визначення...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${css.location} ${isHome ? css.whiteLocation : ""}`}>
        <span className={css.locationIcon}>❌</span>
        <span>Помилка геолокації</span>
      </div>
    );
  }

  if (!city && !country) {
    return (
      <div className={`${css.location} ${isHome ? css.whiteLocation : ""}`}>
        <span className={css.locationIcon}>📍</span>
        <span>Місцезнаходження не визначено</span>
      </div>
    );
  }

  return (
    <div className={`${css.location} ${isHome ? css.whiteLocation : ""}`}>
      <span className={css.locationIcon}>📍</span>
      <span>{city ? `${city}, ${country}` : country}</span>
    </div>
  );
};
