import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { Typography } from "../Typography/Typography";
import { Button } from "../Button/Button";
import { Input } from "../Input/Input";
import { openSignIn, selectIsLoggedIn } from "../../store/auth";

import styles from "./Hero.module.css";

export const Hero = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const [searchQuery, setSearchQuery] = useState("");

  const handleClick = () => {
    dispatch(openSignIn());
  };

  return (
    <section className={styles.container}>
      <div className={styles.heroSection}>
        <div className={styles.heroTextWrapper}>
          <Typography className={styles.heroTitle} variant="h1">
            Свій до Свого по Своє
          </Typography>
          <Typography className={styles.heroSubtitle} variant="body">
            Відкрийте безмежний світ можливостей та скористайтеся якісними
            послугами, що поєднують професіоналізм, надійність та теплу
            атмосферу української спільноти.
          </Typography>
          {isLoggedIn ? (
            <Input
              className={styles.heroSearch}
              variant="uastyle"
              placeholder="Пошук послуг..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          ) : (
            <Button
              className={styles.heroButton}
              variant="uastyleGrayBorder"
              size="medium"
              onClick={handleClick}
            >
              Додати послугу
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};
