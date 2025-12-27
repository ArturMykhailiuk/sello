import styles from "./Copyright.module.css";
import { Typography } from "../Typography/Typography.jsx";
import { useBreakpoint } from "../../hooks/index.js";

export const Copyright = () => {
  const year = new Date().getFullYear();
  const breakpoint = useBreakpoint();
  return (
    <Typography
      variant={breakpoint === "mobile" ? "uablue" : "uablue"}
      className={styles.wrapper}
    >
      &copy; {year}, SELL-O. Всі права застережено
    </Typography>
  );
};
