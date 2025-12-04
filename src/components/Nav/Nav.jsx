import clx from "clsx";
import { useMatch, useNavigate } from "react-router";
import { Button } from "../Button/Button";

import css from "./Nav.module.css";

export const Nav = () => {
  const homePath = useMatch("/");
  const servicePath = useMatch("/service/add");
  const navigate = useNavigate();

  const isHomePage = !!homePath;

  return (
    <nav className={css.container}>
      <ul className={clx(css.list, !isHomePage && css.headerAll)}>
        <li>
          <Button
            className={clx(isHomePage && css.activeBtn)}
            variant={isHomePage ? "uastyleHeaderHomePage" : "uastyleHeader"}
            size="small"
            uabordered={isHomePage}
            onClick={() => navigate("/")}
          >
            Головна
          </Button>
        </li>

        <li>
          <Button
            className={clx(!!servicePath && css.activeBtn)}
            variant={isHomePage ? "uastyleHeader" : "uastyleHeaderHomePage"}
            size="small"
            uabordered={!!servicePath}
            onClick={() => navigate("/service/add")}
          >
            Додати послугу
          </Button>
        </li>
      </ul>
    </nav>
  );
};
