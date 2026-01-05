import React, { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";

import { Pagination } from "../Pagination/Pagination.jsx";
import SearchSelect from "../SearchSelect/SearchSelect.jsx";
import { ServiceCard } from "../ServiceCard/index.js";
import { ServicesMapModal } from "../ServicesMapModal/ServicesMapModal.jsx";
import { useBreakpoint } from "../../hooks/useBreakpoint.js";
import { getServices, searchServices } from "../../services/services.js";
import { normalizeHttpError } from "../../utils/normalizeHttpError.js";
import { DEFAULT_ERROR_MESSAGE } from "../../constants/common.js";

import css from "./ServiceList.module.css";
import { isCancel } from "axios";
import { useSearchParams } from "react-router";

const getCountOfServices = (breakpoint) => {
  if (["desktop", "tablet"].includes(breakpoint)) return 12;
  return 8;
};

export const ServiceList = ({ categoryId, searchQuery }) => {
  const breakpoint = useBreakpoint({ tablet: 540 });
  const [searchParams, setSearchParams] = useSearchParams();
  const [allServices, setAllServices] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(() => searchParams.get("country") ?? null);
  const [currentPage, setCurrentPage] = useState(
    () => searchParams.get("page") ?? 1,
  );
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const servicesPerPage = getCountOfServices(breakpoint);
  const isMobile = ["mobile", "small-mobile"].includes(breakpoint);

  // Отримуємо унікальні країни з поточних послуг
  const availableCountries = useMemo(() => {
    const countriesSet = new Set();
    allServices.forEach(service => {
      if (service.areas && Array.isArray(service.areas)) {
        service.areas.forEach(area => {
          if (area.country) {
            countriesSet.add(area.country);
          }
        });
      }
    });
    return Array.from(countriesSet)
      .sort()
      .map((country, index) => ({ id: index + 1, name: country }));
  }, [allServices]);

  // Фільтруємо послуги по вибраній країні
  const filteredServices = useMemo(() => {
    if (!selectedCountry) return allServices;
    return allServices.filter(service => 
      service.areas && 
      Array.isArray(service.areas) && 
      service.areas.some(area => area.country === selectedCountry)
    );
  }, [allServices, selectedCountry]);

  const total = filteredServices.length;
  const totalPages = Math.ceil(total / servicesPerPage);
  
  // Пагінація на клієнті
  const services = useMemo(() => {
    const startIndex = (currentPage - 1) * servicesPerPage;
    return filteredServices.slice(startIndex, startIndex + servicesPerPage);
  }, [filteredServices, currentPage, servicesPerPage]);

  useEffect(() => {
    const abortController = new AbortController();

    (async () => {
      try {
        // Завантажуємо всі послуги без фільтрації по країні
        const result = searchQuery
          ? await searchServices(
              {
                query: searchQuery,
                categoryId,
                limit: 1000, // Завантажуємо всі для клієнтської фільтрації
                page: 1,
              },
              { signal: abortController.signal },
            )
          : await getServices(
              {
                categoryId,
                limit: 1000, // Завантажуємо всі для клієнтської фільтрації
                page: 1,
              },
              { signal: abortController.signal },
            );

        setAllServices(result.services);
      } catch (error) {
        if (!isCancel(error)) {
          setAllServices([]);
          const { message } = normalizeHttpError(error);
          toast.error(message ?? DEFAULT_ERROR_MESSAGE);
        }
      }
    })();

    return () => {
      abortController.abort();
    };
  }, [categoryId, searchQuery]);

  useEffect(() => {
    setSearchParams((prev) => {
      if (selectedCountry) prev.set("country", selectedCountry);
      else prev.delete("country");

      if (currentPage) prev.set("page", currentPage);
      else prev.delete("page");

      return prev;
    });
  }, [selectedCountry, currentPage, setSearchParams]);

  const handleAreaSelect = (country) => {
    setSelectedCountry(country?.name);
    setCurrentPage(1);
  };

  const handleAreaChange = (value) => {
    // Дозволяємо вводити текст або очищувати
    setSelectedCountry(value || null);
    if (!value) {
      setCurrentPage(1);
    }
  };

  // Підраховуємо всі локації (не послуги) з урахуванням фільтра країн
  const totalLocations = useMemo(() => {
    return filteredServices.reduce((count, service) => {
      if (service.areas && Array.isArray(service.areas)) {
        const validAreas = service.areas.filter((area) => {
          // Фільтруємо по країні якщо вибрана
          if (selectedCountry && area.country !== selectedCountry) {
            return false;
          }
          const lat = area?.latitude;
          const lng = area?.longitude;
          return (
            lat &&
            lng &&
            lat !== "undefined" &&
            lng !== "undefined" &&
            !isNaN(parseFloat(lat)) &&
            !isNaN(parseFloat(lng))
          );
        });
        return count + validAreas.length;
      }
      return count;
    }, 0);
  }, [filteredServices, selectedCountry]);

  return (
    <div className={css.servicesBlock}>
      <div className={css.servicesFiltersBlock}>
        <SearchSelect
          items={availableCountries}
          placeholder="Країна"
          value={selectedCountry ?? ""}
          onSelect={handleAreaSelect}
          onChange={handleAreaChange}
        />
        {totalLocations > 0 && (
          <button
            className={css.showMapButton}
            onClick={() => setIsMapModalOpen(true)}
          >
            📍 Показати на карті ({totalLocations})
          </button>
        )}
      </div>

      <div className={css.servicesListBlock}>
        {searchQuery && total === 0 ? (
          <div className={css.emptyMessage}>
            <p
              style={{
                fontSize: "18px",
                textAlign: "center",
                margin: "40px 0",
              }}
            >
              Нічого не знайдено за запитом <strong>"{searchQuery}"</strong>
            </p>
            <p style={{ fontSize: "14px", textAlign: "center", color: "#666" }}>
              Спробуйте інші ключові слова, наприклад: "ремонт", "послуга",
              "дизайн"
            </p>
          </div>
        ) : (
          <>
            <div className={css.serviceList}>
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  serviceId={service.id}
                  title={service.title}
                  image={service.thumb}
                  description={service.description}
                  owner={service.owner}
                  isFavorite={service.isFavorite}
                  isMobile={isMobile}
                />
              ))}
            </div>
            <Pagination
              totalPages={totalPages}
              activePage={currentPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </>
        )}
      </div>

      <ServicesMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        services={services}
      />
    </div>
  );
};
