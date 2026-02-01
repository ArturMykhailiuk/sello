import { useState, useMemo } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  MarkerClusterer,
} from "@react-google-maps/api";
import { ServiceMarkerInfo } from "../ServiceMarkerInfo/ServiceMarkerInfo";
import styles from "./ServicesMap.module.css";
import locationPinIcon from "../../assets/icons/location-pin.svg";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  scaleControl: true,
  streetViewControl: true,
  rotateControl: false,
  fullscreenControl: true,
  gestureHandling: "greedy", // Дозволяє переміщення одним пальцем
};

const clustererOptions = {
  imagePath:
    "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
  gridSize: 60,
  maxZoom: 15,
};

export const ServicesMap = ({ services }) => {
  const [selectedLocations, setSelectedLocations] = useState([]); // Масив вибраних локацій
  const [map, setMap] = useState(null);
  const [clusterer, setClusterer] = useState(null);

  // Створюємо плоский список всіх локацій з усіх послуг
  const serviceLocations = useMemo(() => {
    const locations = [];
    services.forEach((service) => {
      if (service.areas && Array.isArray(service.areas)) {
        service.areas.forEach((area) => {
          const lat = area?.latitude;
          const lng = area?.longitude;
          if (
            lat &&
            lng &&
            lat !== "undefined" &&
            lng !== "undefined" &&
            !isNaN(parseFloat(lat)) &&
            !isNaN(parseFloat(lng))
          ) {
            locations.push({
              service,
              area,
              lat: parseFloat(lat),
              lng: parseFloat(lng),
            });
          }
        });
      }
    });

    console.log("Total service locations:", locations.length);
    locations.forEach((loc, index) => {
      console.log(`Location ${index + 1} (Service ID: ${loc.service.id}):`, {
        lat: loc.lat,
        lng: loc.lng,
        title: loc.service.title,
        address: loc.area.formattedAddress,
      });
    });

    return locations;
  }, [services]);

  // Обчислюємо центр карти на основі всіх локацій
  const center = useMemo(() => {
    if (serviceLocations.length === 0) {
      return { lat: 50.4501, lng: 30.5234 }; // Київ за замовчуванням
    }

    if (serviceLocations.length === 1) {
      return {
        lat: serviceLocations[0].lat,
        lng: serviceLocations[0].lng,
      };
    }

    const avgLat =
      serviceLocations.reduce((sum, loc) => sum + loc.lat, 0) /
      serviceLocations.length;
    const avgLng =
      serviceLocations.reduce((sum, loc) => sum + loc.lng, 0) /
      serviceLocations.length;

    return { lat: avgLat, lng: avgLng };
  }, [serviceLocations]);

  // Обчислюємо zoom
  const zoom = useMemo(() => {
    if (serviceLocations.length === 0) return 12;
    if (serviceLocations.length === 1) return 14;

    return serviceLocations.length > 10 ? 11 : 12;
  }, [serviceLocations]);

  const handleMarkerClick = (service, area) => {
    // Додаємо або видаляємо локацію зі списку вибраних
    const locationKey = `${service.id}-${area.id}`;
    const isSelected = selectedLocations.some(
      loc => `${loc.service.id}-${loc.area.id}` === locationKey
    );

    if (isSelected) {
      // Видаляємо з вибраних
      setSelectedLocations(prev => 
        prev.filter(loc => `${loc.service.id}-${loc.area.id}` !== locationKey)
      );
    } else {
      // Додаємо до вибраних
      setSelectedLocations(prev => [...prev, { service, area }]);
    }
  };

  const handleInfoWindowClose = (service, area) => {
    const locationKey = `${service.id}-${area.id}`;
    setSelectedLocations(prev => 
      prev.filter(loc => `${loc.service.id}-${loc.area.id}` !== locationKey)
    );
  };

  // Обробник завершення кластеризації
  const handleClusteringEnd = (clustererInstance) => {
    if (!clustererInstance || !map) return;

    // Отримуємо поточний зум
    const currentZoom = map.getZoom();
    
    // Перевіряємо чи зум більший за maxZoom кластера (кластери розібрані)
    if (currentZoom > clustererOptions.maxZoom) {
      // Отримуємо всі видимі маркери
      const bounds = map.getBounds();
      if (!bounds) return;

      const visibleLocations = serviceLocations.filter((location) => {
        const position = new window.google.maps.LatLng(location.lat, location.lng);
        return bounds.contains(position);
      });

      // Відкриваємо картки для всіх видимих маркерів
      if (visibleLocations.length > 0) {
        setSelectedLocations(visibleLocations);
      }
    } else {
      // Якщо зум менший (є кластери), закриваємо всі картки
      setSelectedLocations([]);
    }
  };

  // Обробник зміни видимої області карти
  const handleBoundsChanged = () => {
    if (!map || !clusterer) return;

    const currentZoom = map.getZoom();
    
    // Якщо зум більший за maxZoom - показуємо картки
    if (currentZoom > clustererOptions.maxZoom) {
      const bounds = map.getBounds();
      if (!bounds) return;

      const visibleLocations = serviceLocations.filter((location) => {
        const position = new window.google.maps.LatLng(location.lat, location.lng);
        return bounds.contains(position);
      });

      setSelectedLocations(visibleLocations);
    } else {
      // Якщо зум менший або рівний maxZoom - закриваємо картки
      setSelectedLocations([]);
    }
  };

  if (serviceLocations.length === 0) {
    return (
      <div className={styles.noServices}>
        <p>Немає послуг з локацією для відображення на карті</p>
      </div>
    );
  }

  const customMarkerIcon = {
    url: locationPinIcon,
    scaledSize: { width: 40, height: 40 }, // Розмір іконки
    anchor: { x: 20, y: 40 }, // Точка прив'язки (низ по центру)
  };

  return (
    <div className={styles.mapContainer}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        options={mapOptions}
        onLoad={(mapInstance) => setMap(mapInstance)}
        onZoomChanged={handleBoundsChanged}
        onBoundsChanged={handleBoundsChanged}
      >
        <MarkerClusterer 
          options={clustererOptions}
          onLoad={(clustererInstance) => setClusterer(clustererInstance)}
        >
          {(clusterer) => {
            console.log("Rendering markers, count:", serviceLocations.length);
            return serviceLocations.map((location, index) => {
              // Унікальний ключ для кожної комбінації service + area
              const key = `${location.service.id}-${index}`;

              console.log(
                `Marker ${index} for service ${location.service.id}:`,
                {
                  lat: location.lat,
                  lng: location.lng,
                  address: location.area.formattedAddress,
                },
              );

              return (
                <Marker
                  key={key}
                  position={{ lat: location.lat, lng: location.lng }}
                  clusterer={clusterer}
                  onClick={() =>
                    handleMarkerClick(location.service, location.area)
                  }
                  title={`${location.service.title} - ${
                    location.area.formattedAddress || location.area.city
                  }`}
                  icon={customMarkerIcon}
                />
              );
            });
          }}
        </MarkerClusterer>

        {selectedLocations.map((location, index) => (
          <InfoWindow
            key={`info-${location.service.id}-${index}`}
            position={{
              lat: parseFloat(location.area.latitude),
              lng: parseFloat(location.area.longitude),
            }}
            onCloseClick={() => handleInfoWindowClose(location.service, location.area)}
            options={{
              pixelOffset: new window.google.maps.Size(0, -10),
            }}
          >
            <div className={styles.infoWindow}>
              <ServiceMarkerInfo
                service={location.service}
                area={location.area}
              />
            </div>
          </InfoWindow>
        ))}
      </GoogleMap>
    </div>
  );
};
