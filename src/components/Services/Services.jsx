import React from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router";

import Container from "../UI/Container/Container.jsx";
import { Typography } from "../Typography/Typography.jsx";
import { ServiceList } from "../ServiceList/index.js";
import { selectCategories } from "../../store/categories/selectors.js";
import {
  Breadcrumbs,
  BreadcrumbsItem,
  BreadcrumbsDivider,
} from "../Breadcrumbs/Breadcrumbs.jsx";

import css from "./Services.module.css";
import ArrowLeftIcon from "../../assets/icons/arrow-left.svg?react";

export const Services = ({ categoryId, searchQuery }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categories = useSelector(selectCategories);

  const selectedCountry = searchParams.get("country");
  const selectedCity = searchParams.get("city");

  const handleBackClick = () => {
    navigate("/");
    // Примусовий скрол вгору після навігації
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, 0);
  };

  const handleCategoryClick = () => {
    // Скидаємо всі фільтри, залишаємо тільки категорію
    const params = new URLSearchParams();
    if (categoryId) params.set("category", categoryId);
    if (searchQuery) params.set("search", searchQuery);
    navigate(`/?${params.toString()}`);
  };

  const handleCountryClick = () => {
    // Скидаємо тільки місто, залишаємо країну та категорію
    const params = new URLSearchParams();
    if (categoryId) params.set("category", categoryId);
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCountry) params.set("country", selectedCountry);
    navigate(`/?${params.toString()}`);
  };

  const currentCategory = categories.find(({ id }) => id === categoryId) ?? {};

  const title = searchQuery
    ? `Результати пошуку: "${searchQuery}"`
    : `Категорія: ${currentCategory.name}`;

  return (
    <section>
      <Container className={css.container}>
        <Breadcrumbs className={css.breadcrumbs}>
          <BreadcrumbsItem
            className={css.breadcrumbsItem}
            onClick={handleBackClick}
          >
            Головна
          </BreadcrumbsItem>
          <BreadcrumbsDivider />
          <BreadcrumbsItem
            isActive={!selectedCountry && !selectedCity}
            onClick={
              selectedCountry || selectedCity ? handleCategoryClick : undefined
            }
          >
            {searchQuery ? "Пошук" : currentCategory.name || "Всі категорії"}
          </BreadcrumbsItem>
          {selectedCountry && (
            <>
              <BreadcrumbsDivider />
              <BreadcrumbsItem
                isActive={!selectedCity}
                onClick={selectedCity ? handleCountryClick : undefined}
              >
                {selectedCountry}
              </BreadcrumbsItem>
            </>
          )}
          {selectedCity && (
            <>
              <BreadcrumbsDivider />
              <BreadcrumbsItem isActive>{selectedCity}</BreadcrumbsItem>
            </>
          )}
        </Breadcrumbs>

        <div className={css.servicesTitleBlock}>
          {/* <button
            className={css.servicesBackButton}
            type="button"
            onClick={handleBackClick}
          >
            <ArrowLeftIcon className={css.servicesBackIcon} />
            Повернутися
          </button> */}
          <Typography className={css.servicesCategory} variant="h1">
            {title}
          </Typography>
          {/* <Typography className={css.servicesDescription} variant="body">
            Об’єднуймо наші зусилля, знання та таланти, щоб створювати послуги,
            які надихають і приносять цінність кожному клієнтові.
          </Typography> */}
        </div>

        <ServiceList categoryId={categoryId} searchQuery={searchQuery} />
      </Container>
    </section>
  );
};
