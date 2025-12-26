import { NavLink } from "react-router";
import LogoSvg from "../../assets/icons/logo_test.svg?react";
import styles from "./Logo.module.css";

export const Logo = () => {
  return (
    <NavLink
      className={styles.navLink}
      to="/"
      aria-label="Logo SELL-O"
    >
      <LogoSvg className={styles.logoImage} />
    </NavLink>
  );
};
