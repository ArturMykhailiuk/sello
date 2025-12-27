import { useEffect, useState } from "react";
import { Link, useMatch } from "react-router";
import { useSelector } from "react-redux";
import clx from "clsx";

import { AuthBar } from "../AuthBar";
import Container from "../UI/Container/Container";
import { Nav } from "../Nav";
import { UserBar } from "../UserBar";
import { NavMenu } from "../NavMenu";
import { LocationDisplay } from "../LocationDisplay/LocationDisplay";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { selectIsLoggedIn } from "../../store/auth";

import css from "./Header.module.css";

import BurgerMenuIcon from "../../assets/icons/burger-menu.svg?react";
import clsx from "clsx";
import LogoIcon from "../../assets/icons/logo_test.svg?react";
import { Logo } from "../Logo/Logo";

export default function Header() {
  const homePath = useMatch("/");
  const isHome = !!homePath;
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const breakpoint = useBreakpoint();
  const isMobile = ["mobile", "small-mobile"].includes(breakpoint);

  const [isOpenMenu, setIsOpenMenu] = useState(false);

  useEffect(() => {
    if (!isMobile) setIsOpenMenu(false);
  }, [isMobile]);

  return (
    <>
      <div className={css.locationWrapper}>
        <LocationDisplay />
      </div>
      <header className={clsx(css.header, isHome && css.homeHeader)}>
        <Container className={css.container}>
          <div className={css.leftSection}>
            <Logo />
          </div>

          {!isMobile && <Nav />}

          <div className={css.profileContainer}>
            {isLoggedIn ? <UserBar /> : <AuthBar />}

            {isMobile && isLoggedIn && (
              <button
                type="button"
                className={clx(css.menuBtn, isHome && css.whiteMenuBtn)}
                onClick={() => setIsOpenMenu(true)}
              >
                <BurgerMenuIcon className={css.menuIcon} />
              </button>
            )}
          </div>
        </Container>
      </header>

      {isOpenMenu && (
        <NavMenu isHomePage={isHome} onClose={() => setIsOpenMenu(false)} />
      )}
    </>
  );
}
