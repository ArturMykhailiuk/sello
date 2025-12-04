import { NavLink } from "react-router";
import clx from "clsx";
import LogoSvg from "../../assets/icons/logo_test.svg?react";
import styles from "./Logo.module.css";

export const Logo = () => {
  return (
    <NavLink
      className={clx(styles.navLink, styles.logo, styles.logoWhite)}
      to="/"
      aria-label="Logo SELL-O"
    >
      <LogoSvg className={styles.logoImage} />
    </NavLink>
  );
};
