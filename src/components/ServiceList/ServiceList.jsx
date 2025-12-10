import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import { Pagination } from "../Pagination/Pagination.jsx";
import SearchSelect from "../SearchSelect/SearchSelect.jsx";
import { ServiceCard } from "../ServiceCard/index.js";
import { ServicesMapModal } from "../ServicesMapModal/ServicesMapModal.jsx";
import { selectAreas } from "../../store/areas/index.js";
// import { selectItems } from "../../store/items/index.js";
import { useBreakpoint } from "../../hooks/useBreakpoint.js";
import { getServices } from "../../services/services.js";
import { normalizeHttpError } from "../../utils/normalizeHttpError.js";
import { DEFAULT_ERROR_MESSAGE } from "../../constants/common.js";

import css from "./ServiceList.module.css";
import { isCancel } from "axios";
import { useSearchParams } from "react-router";

const getCountOfServices = (breakpoint) => {
  if (["desktop", "tablet"].includes(breakpoint)) return 12;
  return 8;
};

export const ServiceList = ({ categoryId }) => {
  const areas = useSelector(selectAreas);
  // const items = useSelector(selectItems);
  const breakpoint = useBreakpoint({ tablet: 540 });
  const [searchParams, setSearchParams] = useSearchParams();

  const [services, setServices] = useState([]);
  const [areaId, setAreaId] = useState(() => searchParams.get("area") ?? null);
  // const [itemId, setItemId] = useState(() => searchParams.get("item") ?? null);
  const [currentPage, setCurrentPage] = useState(
    () => searchParams.get("page") ?? 1,
  );
  const [total, setTotal] = useState(0);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const servicesPerPage = getCountOfServices(breakpoint);
  const isMobile = ["mobile", "small-mobile"].includes(breakpoint);

  useEffect(() => {
    const abortController = new AbortController();

    (async () => {
      try {
        const { total, services } = await getServices(
          {
            categoryId,
            areaId,
            // itemId,
            limit: servicesPerPage,
            page: currentPage,
          },
          { signal: abortController.signal },
        );
        setServices(services);
        setTotal(total);
      } catch (error) {
        if (!isCancel(error)) {
          setServices([]);
          setTotal(0);
          const { message } = normalizeHttpError(error);
          toast.error(message ?? DEFAULT_ERROR_MESSAGE);
        }
      }
    })();

    return () => {
      abortController.abort();
    };
  }, [categoryId, areaId, currentPage, servicesPerPage]);

  useEffect(() => {
    setSearchParams((prev) => {
      if (areaId) prev.set("area", areaId);
      else prev.delete("area");

      // if (itemId) prev.set("item", itemId);
      // else prev.delete("item");

      if (currentPage) prev.set("page", currentPage);
      else prev.delete("page");

      return prev;
    });
  }, [areaId, currentPage, setSearchParams]);

  // const handleItemSelect = (item) => {
  //   setItemId(item?.id);
  //   setCurrentPage(1);
  // };

  // const handleItemChange = (value) => {
  //   if (value) return;
  //   setItemId(null);
  //   setCurrentPage(1);
  // };

  const handleAreaSelect = (area) => {
    setAreaId(area?.id);
    setCurrentPage(1);
  };

  const handleAreaChange = (value) => {
    if (value) return;
    setAreaId(null);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(total / servicesPerPage);

  // const currentItem = itemId
  //   ? items.find(({ id }) => id === Number(itemId))
  //   : {};

  const currentArea = areaId
    ? areas.find(({ id }) => id === Number(areaId))
    : {};

  // Підраховуємо всі локації (не послуги)
  const totalLocations = services.reduce((count, service) => {
    if (service.areas && Array.isArray(service.areas)) {
      const validAreas = service.areas.filter((area) => {
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

  return (
    <div className={css.servicesBlock}>
      <div className={css.servicesFiltersBlock}>
        {/* <SearchSelect
          items={items}
          placeholder="Items"
          value={currentItem?.name ?? ""}
          onSelect={handleItemSelect}
          onChange={handleItemChange}
        /> */}
        <SearchSelect
          items={areas}
          placeholder="Країна"
          value={currentArea?.country ?? ""}
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
      </div>

      <ServicesMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        services={services}
      />
    </div>
  );
};
