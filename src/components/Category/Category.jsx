import { useEffect, useState } from "react";

import { CategoryList } from "../../components/CategoriesList/CategoriesList";
import Container from "../../components/UI/Container/Container";
import { Typography } from "../../components/Typography/Typography";
import { useBreakpoint } from "../../hooks/useBreakpoint";

import css from "./Category.module.css";

// import allCategories from "./categoriesList.json";
import { fetchCategories } from "../../services/categories";

// const getCountOfCategories = (breakpoint) => {
//   if (["desktop", "tablet"].includes(breakpoint)) return 11;
// return 8;
// };

export function Category() {
  const breakpoint = useBreakpoint({ tablet: 640 });
  const [categories, setCategories] = useState([]);

  // useEffect(() => {
  //   setCategories(allCategories.slice(0, getCountOfCategories(breakpoint)));
  // }, [breakpoint]);

  useEffect(() => {
    fetchCategories().then((res) => setCategories(res.categories));
  }, [breakpoint]);

  return (
    <section>
      <Container className={css.container}>
        <div className={css.headWrapper}>
          <Typography variant="h2" textColor="blue" className={css.title}>
            Категорії послуг
          </Typography>
        </div>

        {categories.length > 0 && <CategoryList categories={categories} />}
      </Container>
    </section>
  );
}
