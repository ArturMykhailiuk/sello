import { useNavigate } from "react-router";
import { ButtonIcon } from "../ButtonIcon/ButtonIcon";
import { Button } from "../Button/Button";
import css from "./CategoryItem.module.css";
import ArrowUpRight from "../../assets/icons/arrow-up-right.svg?react";

export default function CategoryItem({ data }) {
  const categoryName = data.name;
  const navigate = useNavigate();
  console.log("Rendering CategoryItem for:", categoryName);

  return (
    // <div className={`${css.thumb} ${css[categoryName.toLowerCase()]}`}>
    <div className={css.thumb}>
      <img src={data.thumb} alt={categoryName} className={css.image} />

      <div className={css.wrapper}>
        {/* <p className={css.label}>{data.ua}</p> */}
        {/* <p className={css.label}>{categoryName}</p> */}
        <Button
          className={css.categoryButton}
          variant="transparent"
          size="small"
          onClick={() => navigate(`/?category=${data.id}`)}
        >
          {categoryName}
        </Button>
        {/* <ButtonIcon
          variant="transparent"
          size="medium"
          type="button"
          icon={<ArrowUpRight />}
          onClick={() => navigate(`/?category=${data.id}`)}
        /> */}
      </div>
    </div>
  );
}
