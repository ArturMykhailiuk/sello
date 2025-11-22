import { useState, useEffect } from "react";

export const useGeolocation = () => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    city: null,
    country: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        loading: false,
        error: "Geolocation not supported",
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Використовуємо безкоштовний API для reverse geocoding
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=uk`,
          );
          const data = await response.json();

          setLocation({
            latitude,
            longitude,
            city: data.city || data.locality,
            country: data.countryName,
            loading: false,
            error: null,
          });
        } catch {
          setLocation((prev) => ({
            ...prev,
            latitude,
            longitude,
            loading: false,
            error: "Failed to get location name",
          }));
        }
      },
      (error) => {
        setLocation((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
      },
    );
  }, []);

  return location;
};
