// import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router";
import { useState, useEffect } from "react";

import { Typography } from "../Typography/Typography";
// import { Button } from "../Button/Button";
import { Input } from "../Input/Input";
// import { openSignIn, selectIsLoggedIn } from "../../store/auth";

import styles from "./Hero.module.css";
import { ButtonIcon } from "../ButtonIcon/ButtonIcon";
import SearchIcon from "../../assets/icons/search.svg?react";

export const Hero = () => {
  // const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // const isLoggedIn = useSelector(selectIsLoggedIn);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );

  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    
    // Зберігаємо поточну категорію якщо вона є
    const currentCategory = searchParams.get("category");
    
    if (trimmedQuery.length >= 2) {
      const params = new URLSearchParams();
      params.set("search", trimmedQuery);
      if (currentCategory) {
        params.set("category", currentCategory);
      }
      navigate(`/?${params.toString()}`);
    } else if (trimmedQuery.length === 0) {
      // Якщо очистили пошук, залишаємо категорію
      if (currentCategory) {
        navigate(`/?category=${currentCategory}`);
      } else {
        navigate("/");
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  // const handleClick = () => {
  //   dispatch(openSignIn());
  // };

  return (
    <section className={styles.container}>
      <div className={styles.heroSection}>
        <div className={styles.heroTextWrapper}>
          <Typography className={styles.heroTitle} variant="h1">
            Свій до Свого по Своє
          </Typography>
          {/* <Typography className={styles.heroSubtitle} variant="body">
            Відкрийте безмежний світ можливостей та скористайтеся якісними
            послугами, що поєднують професіоналізм, надійність та теплу
            атмосферу української спільноти.
          </Typography> */}
          <div className={styles.searchWrapper}>
            <Input
              className={styles.heroSearch}
              variant="uastyle"
              placeholder="Швидкий пошук послуг (мін. 2 символи)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <ButtonIcon
              className={styles.searchButton}
              onClick={handleSearch}
              type="button"
              disabled={
                searchQuery.trim().length > 0 && searchQuery.trim().length < 2
              }
              icon={<SearchIcon />}
            >
              🔍
            </ButtonIcon>
          </div>
        </div>
      </div>
    </section>
  );
};
