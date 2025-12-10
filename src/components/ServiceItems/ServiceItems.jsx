import { IngredientBadge } from "../IngredientBadge/IngredientBadge";
import { Typography } from "../Typography/Typography";

import css from "./ServiceItems.module.css";

export const ServiceItems = ({ items }) => {
  return (
    <div>
      <Typography className={css.title} variant="h5" textColor="uablue">
        Деталізація послуги:
      </Typography>

      <ul className={css.list}>
        {items.map((item) => (
          <li key={item.id}>
            <IngredientBadge
              imgURL={item.imgURL}
              name={item.name}
              measure={item.measure}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
