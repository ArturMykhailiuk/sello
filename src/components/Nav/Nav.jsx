import clx from "clsx";
import { useMatch, useNavigate } from "react-router";
import { Button } from "../Button/Button";

import css from "./Nav.module.css";

export const Nav = () => {
  const homePath = useMatch("/");
  const servicePath = useMatch("/service/add");
  const navigate = useNavigate();

  const isHomePage = !!homePath;
  const isServicePage = !!servicePath;
  console.log("isHomePage", isHomePage);
  console.log("isServicePage", isServicePage);

  return (
    <nav className={css.container}>
      <ul className={clx(css.list, !isHomePage && css.headerAll)}>
        <li>
          <Button
            variant={
              isHomePage
                ? "uastyleHeaderActivePage"
                : "uastyleHeaderNotActivePage"
            }
            size="small"
            uabordered={isHomePage}
            onClick={() => navigate("/")}
          >
            Головна
          </Button>
        </li>

        <li>
          <Button
            variant={
              isServicePage
                ? "uastyleHeaderActivePage"
                : "uastyleHeaderNotActivePage"
            }
            size="small"
            uabordered={isServicePage}
            onClick={() => navigate("/service/add")}
          >
            Додати послугу
          </Button>
        </li>
      </ul>
    </nav>
  );
};
