import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";

import Container from "../UI/Container/Container.jsx";
import { Typography } from "../Typography/Typography.jsx";
import { ServiceList } from "../ServiceList/index.js";
import { selectCategories } from "../../store/categories/selectors.js";

import css from "./Services.module.css";
import ArrowLeftIcon from "../../assets/icons/arrow-left.svg?react";

export const Services = ({ categoryId }) => {
  const navigate = useNavigate();
  const categories = useSelector(selectCategories);

  const handleBackClick = () => {
    navigate("/");
  };

  const currentCategory = categories.find(({ id }) => id === categoryId) ?? {};

  return (
    <section>
      <Container className={css.container}>
        <div className={css.servicesTitleBlock}>
          <button
            className={css.servicesBackButton}
            type="button"
            onClick={handleBackClick}
          >
            <ArrowLeftIcon className={css.servicesBackIcon} />
            Back
          </button>
          <Typography className={css.servicesCategory} variant="h1">
            {currentCategory.name}
          </Typography>
          <Typography className={css.servicesDescription} variant="body">
            Go on a taste journey, where every sip is a sophisticated creative
            chord, and every dessert is an expression of the most refined
            gastronomic desires.
          </Typography>
        </div>

        <ServiceList categoryId={categoryId} />
      </Container>
    </section>
  );
};
