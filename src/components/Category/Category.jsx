import { useEffect, useState } from "react";
import { CategoryList } from "../../components/CategoriesList/CategoriesList";
import Container from "../../components/UI/Container/Container";
import { Typography } from "../../components/Typography/Typography";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { fetchCategories } from "../../services/categories";
import css from "./Category.module.css";

export function Category() {
  const breakpoint = useBreakpoint({ tablet: 640 });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories(1, 100).then((res) => setCategories(res.categories));
  }, [breakpoint]);

  // Скрол до обраної категорії при поверненні
  useEffect(() => {
    const savedCategoryId = sessionStorage.getItem("selectedCategoryId");
    if (savedCategoryId && categories.length > 0) {
      setTimeout(() => {
        const element = document.getElementById(`category-${savedCategoryId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          sessionStorage.removeItem("selectedCategoryId");
        }
      }, 100);
    }
  }, [categories]);

  return (
    <section>
      <Container className={css.container}>
        <div className={css.headWrapper}>
          <Typography variant="h3" textColor="uablue">
            Категорії послуг
          </Typography>
        </div>

        {categories.length > 0 && <CategoryList categories={categories} />}
      </Container>
    </section>
  );
}
