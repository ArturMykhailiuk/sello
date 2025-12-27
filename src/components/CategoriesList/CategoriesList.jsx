import CategoryItem from "../CategoryItem/CategoryItem";
import css from "./CategoriesList.module.css";

export function CategoryList({ categories }) {
  return (
    <ul className={css.ulCategoryList}>
      {categories.map((category) => (
        <li className={css.liCatlist} key={category.id}>
          <CategoryItem data={category} />
        </li>
      ))}
    </ul>
  );
}
