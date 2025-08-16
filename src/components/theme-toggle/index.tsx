"use client";

import classNames from "classnames";
import { type FC, useEffect } from "react";
import { useCookies } from "react-cookie";
import { BsMoonFill, BsSunFill } from "react-icons/bs";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { Logger } from "@/utils/services";
import * as S from "./styles";

type Props = {};

export const ThemeToggle: FC<Props> = ({}) => {
  const theme = useGlobalState("theme");
  const set = useGlobalStoreSet();
  const [, setCookie] = useCookies(["theme"]);

  const toggleTheme = () => {
    set({ theme: theme === "light" ? "dark" : "light" });
  };

  useEffect(() => {
    setCookie("theme", theme, { path: "/" });
  }, [theme]);

  Logger.info("ThemeToggle rendered");
  return (
    <S.Container>
      <S.ThemeSwitcher onClick={toggleTheme}>
        <S.ThemeSwitchInner
          className={classNames({
            dark: theme === "dark",
            light: theme === "light",
          })}
        >
          <BsSunFill color={S.THEME_SWITCHER.SUN_COLOR} className="sun" />
          <BsMoonFill color={S.THEME_SWITCHER.MOON_COLOR} className="moon" />
        </S.ThemeSwitchInner>
      </S.ThemeSwitcher>
    </S.Container>
  );
};

export default ThemeToggle;
