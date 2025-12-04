import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";

import { Typography } from "../Typography/Typography";
import { Image } from "../Image/Image";
import { ServiceItems } from "../ServiceItems";
import { Avatar } from "../Avatar/Avatar";
import { normalizeImagePath } from "../../utils";
import { useBreakpoint } from "../../hooks/useBreakpoint";

import css from "./ServiceMainInfo.module.css";
import { ServiceDetail } from "../ServiceDetail";
import { openSignIn, selectIsLoggedIn } from "../../store/auth";

export const ServiceMainInfo = ({
  serviceId,
  imgURL,
  title,
  category,
  description,
  owner,
  items,
  instructions,
  isFavorite,
  updateFavoriteStatus,
}) => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const breakpoint = useBreakpoint();
  const navigate = useNavigate();

  const textColor = ["small-mobile", "mobile"].includes(breakpoint)
    ? "gray"
    : "black";

  const navigateToAuthor = () => {
    if (!isLoggedIn) {
      dispatch(openSignIn());
      return;
    }

    navigate(`/user/${owner?.id}`);
  };

  const avatarUrl = owner?.avatarURL && normalizeImagePath(owner.avatarURL);

  return (
    <div className={css.container}>
      <div className={css.thumb}>
        <Image
          src={normalizeImagePath(imgURL)}
          alt={title}
          className={css.img}
        />
      </div>

      <div className={css.info}>
        <div>
          <Typography variant="h3">{title}</Typography>

          <div className={css.category}>
            <span>{category?.name}</span>
          </div>

          <Typography
            variant="body"
            textColor={textColor}
            className={css.description}
          >
            {description}
          </Typography>

          <button
            className={css.authorBlock}
            type="button"
            onClick={navigateToAuthor}
          >
            <Avatar
              src={avatarUrl}
              size={32}
              alt={owner?.name}
              name={owner?.name}
            />
            <div className={css.authorText}>
              <Typography variant="body" textColor="gray">
                Created by:
              </Typography>

              <Typography variant="body" textColor="main">
                {owner?.name}
              </Typography>
            </div>
          </button>
        </div>

        <ServiceItems items={items} />
        <ServiceDetail
          serviceId={serviceId}
          isFavorite={isFavorite}
          instructions={instructions}
          textColor={textColor}
          updateFavoriteStatus={updateFavoriteStatus}
        />
      </div>
    </div>
  );
};
