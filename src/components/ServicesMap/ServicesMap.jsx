import { useState, useMemo } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  MarkerClusterer,
} from "@react-google-maps/api";
import { ServiceMarkerInfo } from "../ServiceMarkerInfo/ServiceMarkerInfo";
import styles from "./ServicesMap.module.css";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
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
  const [selectedService, setSelectedService] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null); // Додаємо вибрану area

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
    setSelectedService(service);
    setSelectedArea(area);
  };

  const handleInfoWindowClose = () => {
    setSelectedService(null);
    setSelectedArea(null);
  };

  if (serviceLocations.length === 0) {
    return (
      <div className={styles.noServices}>
        <p>Немає послуг з локацією для відображення на карті</p>
      </div>
    );
  }

  return (
    <div className={styles.mapContainer}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        options={mapOptions}
      >
        <MarkerClusterer options={clustererOptions}>
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
                />
              );
            });
          }}
        </MarkerClusterer>

        {selectedService && selectedArea && (
          <InfoWindow
            position={{
              lat: parseFloat(selectedArea.latitude),
              lng: parseFloat(selectedArea.longitude),
            }}
            onCloseClick={handleInfoWindowClose}
          >
            <div>
              <ServiceMarkerInfo service={selectedService} />
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};
