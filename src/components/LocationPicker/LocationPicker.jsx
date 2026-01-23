import React, { useState, useEffect, useRef } from "react";

const MapStatus = ({ status }) => {
  if (status === "LOADING") return <div>Завантаження карти...</div>;
  if (status === "FAILURE") return <div>Помилка завантаження карти</div>;
  return null;
};

const MapComponent = ({ center, onLocationSelect, mapInstanceRef }) => {
  const mapRef = useRef(null);
  const currentLocationMarker = useRef(null);
  const selectedLocationMarker = useRef(null); // Маркер для обраної точки
  const autocompleteRef = useRef(null);
  const searchInputRef = useRef(null);
  const onLocationSelectRef = useRef(onLocationSelect);

  // Оновлюємо ref
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  // Створюємо карту тільки один раз
  useEffect(() => {
    if (!mapRef.current || !window.google || mapInstanceRef.current) return;

    // Створюємо карту з дефолтним центром
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 50.4501, lng: 30.5234 }, // Дефолтний центр (Київ)
      zoom: 15,
      gestureHandling: "greedy",
    });

    // Обробник кліків
    mapInstanceRef.current.addListener("click", (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      // Видаляємо попередній маркер обраної точки
      if (selectedLocationMarker.current) {
        selectedLocationMarker.current.setMap(null);
      }

      // Створюємо новий маркер для обраної точки
      selectedLocationMarker.current = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        title: "Обрана точка",
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        },
      });

      // Спочатку викликаємо callback з координатами
      if (onLocationSelectRef.current) {
        onLocationSelectRef.current({
          lat,
          lng,
          address: "Визначення адреси...",
          city: "",
          country: "",
          street: "",
        });
      }

      // Використовуємо Google Reverse Geocoding для отримання адреси
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        {
          location: { lat, lng },
          language: "uk",
          region: "UA",
        },
        (results, status) => {
          let formattedAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          let cityName = "";
          let countryName = "";

          if (status === "OK" && results && results.length > 0) {
            // Перебираємо результати від найточнішого до найзагальнішого
            for (let i = 0; i < results.length; i++) {
              const result = results[i];

              // Шукаємо результат з найдетальнішою адресою
              if (
                result.types.includes("street_address") ||
                result.types.includes("route") ||
                result.types.includes("intersection")
              ) {
                formattedAddress = result.formatted_address;
                break;
              }

              // Якщо не знайшли детальну адресу, використовуємо перший результат
              if (i === 0) {
                formattedAddress = result.formatted_address;
              }
            }

            // Витягуємо місто і країну з найкращого результату
            const bestResult = results[0];
            const components = bestResult.address_components;
            components.forEach((component) => {
              const types = component.types;
              if (types.includes("locality")) {
                cityName = component.long_name;
              } else if (
                types.includes("administrative_area_level_2") &&
                !cityName
              ) {
                cityName = component.long_name;
              } else if (types.includes("country")) {
                countryName = component.long_name;
              }
            });
          } else {
            // Geocoding failed or no results, using coordinates
          }

          // Витягуємо вулицю з найкращого результату
          let streetName = "";
          if (status === "OK" && results && results.length > 0) {
            const bestResult = results[0];
            const components = bestResult.address_components;
            components.forEach((component) => {
              const types = component.types;
              if (types.includes("route")) {
                streetName = component.long_name;
              }
            });
          }

          // Викликаємо callback з отриманою адресою
          if (onLocationSelectRef.current) {
            onLocationSelectRef.current({
              lat,
              lng,
              address: formattedAddress,
              city: cityName,
              country: countryName,
              street: streetName,
            });
          }
        },
      );
    });

    // Ініціалізуємо Google Places Autocomplete
    if (searchInputRef.current && window.google?.maps?.places) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        searchInputRef.current,
        {
          types: ["geocode"],
          language: "uk",
        },
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();

        if (!place.geometry || !place.geometry.location) {
          return;
        }

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        // Центруємо карту на знайденій локації
        mapInstanceRef.current.setCenter({ lat, lng });
        mapInstanceRef.current.setZoom(15);

        // Видаляємо попередній маркер
        if (selectedLocationMarker.current) {
          selectedLocationMarker.current.setMap(null);
        }

        // Створюємо новий маркер
        selectedLocationMarker.current = new window.google.maps.Marker({
          position: { lat, lng },
          map: mapInstanceRef.current,
          title: place.name || "Обрана точка",
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
          },
        });

        // Викликаємо callback з адресою
        if (onLocationSelectRef.current) {
          onLocationSelectRef.current({
            lat,
            lng,
            address:
              place.formatted_address ||
              place.name ||
              `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            city:
              place.address_components?.find((comp) =>
                comp.types.includes("locality"),
              )?.long_name || "",
            country:
              place.address_components?.find((comp) =>
                comp.types.includes("country"),
              )?.long_name || "",
            street:
              place.address_components?.find((comp) =>
                comp.types.includes("route"),
              )?.long_name || "",
          });
        }
      });
    }
  }, [mapInstanceRef]); // Створюємо карту тільки один раз!

  // Додаємо кнопку "Моя позиція" лише при ініціалізації карти
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const locationButton = document.createElement("div");
    locationButton.innerHTML = "Моя локація";
    locationButton.style.cssText = `
      background-color: rgb(255, 255, 255);
      border: 0px;
      margin: 10px;
      padding: 0px 16px;
      text-align: center;
      height: 40px;
      cursor: pointer;
      display: flex;
      align-items: center;
      box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px;
      min-width: 22px;
      font-family: Roboto, Arial, sans-serif;
      font-size: 18px;
      font-weight: 500;
      color: rgb(86, 86, 86);
      user-select: none;
      border-radius: 2px;
    `;

    locationButton.addEventListener("mouseenter", () => {
      locationButton.style.backgroundColor = "rgb(235, 235, 235)";
    });

    locationButton.addEventListener("mouseleave", () => {
      locationButton.style.backgroundColor = "rgb(255, 255, 255)";
    });

    locationButton.addEventListener("click", () => {
      if (center && mapInstanceRef.current) {
        mapInstanceRef.current.setCenter(center);
        mapInstanceRef.current.setZoom(15);
      }
    });

    // Додаємо кнопку на карту
    mapInstanceRef.current.controls[
      window.google.maps.ControlPosition.TOP_RIGHT
    ].push(locationButton);

    // Повертаємо функцію очищення
    return () => {
      if (mapInstanceRef.current) {
        const controls =
          mapInstanceRef.current.controls[
            window.google.maps.ControlPosition.TOP_RIGHT
          ];
        if (controls) {
          const index = controls.getArray().indexOf(locationButton);
          if (index !== -1) {
            controls.removeAt(index);
          }
        }
      }
    };
  }, [mapInstanceRef]);

  // Окремий useEffect для оновлення центру та маркера поточної позиції
  useEffect(() => {
    if (!mapInstanceRef.current || !center) return;

    // Оновлюємо центр карти
    mapInstanceRef.current.setCenter(center);
    mapInstanceRef.current.setZoom(15);

    // Додаємо маркер поточної позиції
    if (currentLocationMarker.current) {
      currentLocationMarker.current.setMap(null);
    }

    currentLocationMarker.current = new window.google.maps.Marker({
      position: center,
      map: mapInstanceRef.current,
      title: "Ваша поточна позиція",
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      },
    });
  }, [center, mapInstanceRef]);

  return (
    <div>
      <div
        style={{
          marginBottom: "10px",
          position: "relative",
        }}
      >
        <input
          ref={searchInputRef}
          type="text"
          placeholder="🔍 Пошук по адресі або назві місця..."
          style={{
            width: "100%",
            padding: "12px 16px",
            border: "2px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "14px",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#3B82F6")}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
        />
      </div>
      <div ref={mapRef} style={{ width: "100%", height: "300px" }} />
    </div>
  );
};

export const LocationPicker = ({
  onLocationSelect,
  initialLocation,
  onMapError,
}) => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapInstanceRef = useRef(null);

  // Автоматично отримуємо поточну геолокацію
  useEffect(() => {
    // Якщо є initialLocation, використовуємо його
    if (initialLocation && initialLocation.lat && initialLocation.lng) {
      setCurrentPosition({
        lat: initialLocation.lat,
        lng: initialLocation.lng,
      });
      setLoading(false);
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentPosition({ lat: latitude, lng: longitude });
          setLoading(false);
        },
        () => {
          if (onMapError) {
            onMapError();
          }
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    } else {
      if (onMapError) {
        onMapError();
      }
      setLoading(false);
    }
  }, [initialLocation, onMapError]);

  const handleLocationSelect = (newLocation) => {
    if (onLocationSelect) {
      onLocationSelect(newLocation);
    }
  };

  // Перевіряємо чи завантажено Google Maps API
  if (!window.google || !window.google.maps) {
    return <div>Завантаження Google Maps...</div>;
  }

  if (loading) {
    return <div>Визначаємо ваше місцезнаходження...</div>;
  }

  if (!currentPosition) {
    return <div>Не вдалося визначити вашу геолокацію</div>;
  }

  return (
    <div>
      <MapComponent
        center={currentPosition}
        onLocationSelect={handleLocationSelect}
        mapInstanceRef={mapInstanceRef}
      />
    </div>
  );
};
