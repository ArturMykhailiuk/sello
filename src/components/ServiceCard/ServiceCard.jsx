import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import toast from "react-hot-toast";

import { Typography } from "../Typography/Typography.jsx";
import { Image } from "../Image/Image.jsx";
import { openSignIn, selectIsLoggedIn } from "../../store/auth/index.js";

import css from "./ServiceCard.module.css";
import ArrowUpIcon from "../../assets/icons/arrow-up-right.svg?react";
import HeartIcon from "../../assets/icons/heart.svg?react";
import ArrowIncrease from "../../assets/icons/arrow-increase.svg?react";
import LocationPin from "../../assets/icons/location-pin.svg?react";
import { DEFAULT_ERROR_MESSAGE } from "../../constants/common.js";
import { normalizeHttpError, normalizeImagePath } from "../../utils/index.js";
import { appClearSessionAction } from "../../store/utils.js";
import {
  addFavoriteService,
  removeFavoriteService,
} from "../../services/services.js";
import { ButtonIcon } from "../ButtonIcon/ButtonIcon.jsx";
import { Avatar } from "../Avatar/Avatar.jsx";

export const ServiceCard = ({
  serviceId,
  title,
  image,
  description,
  owner,
  areas,
  isFavorite: favorite,
  isMobile,
  filterCountry,
  filterCity,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const [isFavorite, setIsFavorite] = useState(favorite);
  const [updating, setUpdating] = useState(false);

  const handleFavoriteClick = async () => {
    if (!isLoggedIn) {
      dispatch(openSignIn());
      return;
    }

    try {
      setUpdating(true);
      let message;

      if (isFavorite) {
        const data = await removeFavoriteService(serviceId);
        message = data.message;
        setIsFavorite(false);
      } else {
        const data = await addFavoriteService(serviceId);
        message = data.message;
        setIsFavorite(true);
      }

      toast.success(message);
    } catch (error) {
      const { message, status } = normalizeHttpError(error);
      toast.error(message ?? DEFAULT_ERROR_MESSAGE);
      if (status === 401) dispatch(appClearSessionAction());
    } finally {
      setUpdating(false);
    }
  };

  const navigateToAuthor = () => {
    if (!isLoggedIn) {
      dispatch(openSignIn());
      return;
    }

    navigate(`/user/${owner.id}`, { state: { from: location } });
  };

  const navigateToService = () => {
    navigate(`/service/${serviceId}`, {
      state: {
        from: location,
        country: filterCountry,
        city: filterCity,
      },
    });
  };

  const imageURL = normalizeImagePath(image);

  return (
    <div className={css.serviceCard}>
      <div
        className={css.thumb}
        onClick={navigateToService}
        style={{ cursor: "pointer" }}
      >
        <Image
          src={imageURL}
          alt={title}
          className={css.serviceImage}
          loading="lazy"
        />
      </div>

      <div className={css.cardInfo}>
        <Typography lineClamp={1} truncate variant="h4" textColor="uablue">
          {title}
        </Typography>
        <Typography
          lineClamp={3}
          truncate
          className={css.cardDescription}
          variant="body"
          textColor="uablue"
        >
          {description}
        </Typography>

        {areas && areas.length > 0 && (
          <div className={css.locations}>
            {areas.map((area, index) => (
              <div key={index} className={css.locationItem}>
                <LocationPin className={css.locationIcon} />
                <Typography
                  variant="bodyS"
                  textColor="gray"
                  truncate
                  className={css.locationText}
                >
                  {area?.formattedAddress ||
                    area?.city ||
                    area?.name ||
                    "Не вказано"}
                </Typography>
              </div>
            ))}
          </div>
        )}

        <div className={css.cardActions}>
          <div className={css.cardAuthorInfo}>
            <button
              type="button"
              className={css.cardAuthorButton}
              onClick={navigateToAuthor}
              aria-label={`View ${owner.name} profile`}
            >
              <Avatar
                src={owner.avatarURL}
                alt={owner.name}
                name={owner.name}
                size={isMobile ? 32 : 40}
              />
            </button>
            <span className={css.cardAuthorName}>{owner.name}</span>
          </div>

          <div className={css.serviceIcons}>
            <ButtonIcon
              variant={isFavorite ? "yellow" : "light"}
              size={isMobile ? "small" : "medium"}
              onClick={handleFavoriteClick}
              disabled={updating}
              icon={isFavorite ? <HeartIcon /> : <HeartIcon />}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            />

            <ButtonIcon
              variant="light"
              size={isMobile ? "small" : "medium"}
              onClick={navigateToService}
              icon={<ArrowIncrease />}
              aria-label="View service details"
              title="View service details"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
