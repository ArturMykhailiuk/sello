import { useState, useEffect, useCallback } from "react";

// Функція для форматування адреси з API відповіді
const formatLocationAddress = (data) => {
  const parts = [];

  // Населений пункт (місто, село)
  const locality = data.city || data.locality || data.principalSubdivision;
  if (locality) {
    parts.push(locality);
  }

  // Вулиця і номер будинку
  const streetParts = [];
  if (data.street) {
    streetParts.push(data.street);
  }
  if (data.streetNumber) {
    streetParts.push(data.streetNumber);
  }

  if (streetParts.length > 0) {
    parts.push(streetParts.join(" "));
  }

  // Країна
  if (data.countryName) {
    parts.push(data.countryName);
  }

  return parts.length > 0 ? parts.join(", ") : "Невідома локація";
};

// Функція для обробки помилок геолокації
const getGeolocationErrorMessage = (code) => {
  switch (code) {
    case 1: // PERMISSION_DENIED
      return "Дозвіл на геолокацію відхилено. Увімкніть геолокацію в налаштуваннях браузера.";
    case 2: // POSITION_UNAVAILABLE
      return "Неможливо визначити місцезнаходження. Перевірте з'єднання з інтернетом.";
    case 3: // TIMEOUT
      return "Час очікування геолокації вичерпано. Спробуйте ще раз.";
    default:
      return "Помилка визначення геолокації.";
  }
};

export const useGeolocation = () => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    city: null,
    country: null,
    address: null,
    street: null,
    loading: true,
    error: null,
  });

  const saveLocationToStorage = useCallback((locationData) => {
    try {
      localStorage.setItem("userLocation", JSON.stringify(locationData));
    } catch (error) {
      console.error("Error saving location to localStorage:", error);
    }
  }, []);

  const getLocationFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem("userLocation");
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error reading location from localStorage:", error);
      return null;
    }
  }, []);

  const setUserLocation = useCallback(
    (newLocation) => {
      console.log("useGeolocation setUserLocation received:", newLocation); // Дебаг

      const locationData = {
        latitude: newLocation.lat,
        longitude: newLocation.lng,
        city: newLocation.city,
        country: newLocation.country,
        address: newLocation.address,
        street: newLocation.street || null,
        loading: false,
        error: null,
      };

      setLocation(locationData);
      saveLocationToStorage(locationData);
    },
    [saveLocationToStorage],
  );

  const clearLocation = useCallback(() => {
    const clearedLocation = {
      latitude: null,
      longitude: null,
      city: null,
      country: null,
      address: null,
      street: null,
      loading: false,
      error: null,
    };

    setLocation(clearedLocation);
    localStorage.removeItem("userLocation");
  }, []);

  const getCurrentPosition = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000, // 1 хвилина замість 5 хвилин
        },
      );
    });
  }, []);

  useEffect(() => {
    // Спочатку перевіряємо збережену локацію
    const storedLocation = getLocationFromStorage();

    if (storedLocation && storedLocation.latitude && storedLocation.longitude) {
      setLocation(storedLocation);
      return;
    }

    // Якщо немає збереженої, пробуємо отримати поточну
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
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=uk&includeRegion=true`,
          );

          if (!response.ok) {
            throw new Error("API request failed");
          }

          const data = await response.json();

          const locationData = {
            latitude,
            longitude,
            city: data.city || data.locality || data.principalSubdivision,
            country: data.countryName,
            address: formatLocationAddress(data),
            street: data.street || null,
            loading: false,
            error: null,
          };

          setLocation(locationData);
          saveLocationToStorage(locationData);
        } catch (error) {
          const basicLocationData = {
            latitude,
            longitude,
            city: null,
            country: null,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            street: null,
            loading: false,
            error: "Failed to get location name",
          };

          setLocation(basicLocationData);
          saveLocationToStorage(basicLocationData);
        }
      },
      (error) => {
        console.error("❌ Geolocation error:", error);
        setLocation((prev) => ({
          ...prev,
          loading: false,
          error: getGeolocationErrorMessage(error.code),
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
      },
    );
  }, [getLocationFromStorage, saveLocationToStorage]);

  return {
    ...location,
    setUserLocation,
    clearLocation,
    getCurrentPosition,
    hasLocationPermission: !location.error && location.latitude !== null,
  };
};
