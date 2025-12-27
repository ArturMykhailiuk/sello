import clx from "clsx";
import { useMatch, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { Button } from "../Button/Button";
import { selectIsLoggedIn } from "../../store/auth";

import css from "./Nav.module.css";

export const Nav = () => {
  const homePath = useMatch("/");
  const aboutPath = useMatch("/about");
  const servicePath = useMatch("/service/add");
  const navigate = useNavigate();
  const isLoggedIn = useSelector(selectIsLoggedIn);

  const isHomePage = !!homePath;
  const isAboutPage = !!aboutPath;
  const isServicePage = !!servicePath;

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

        {isLoggedIn && (
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
        )}

        <li>
          <Button
            variant={
              isAboutPage
                ? "uastyleHeaderActivePage"
                : "uastyleHeaderNotActivePage"
            }
            size="small"
            uabordered={isAboutPage}
            onClick={() => navigate("/about")}
          >
            Про нас
          </Button>
        </li>
      </ul>
    </nav>
  );
};
