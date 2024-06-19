"use client";

import classNames from "classnames";
import { FC, useEffect } from "react";
import { BsMoonFill, BsSunFill } from "react-icons/bs";

import { useStore } from "@/hooks";
import { StoreState } from "@/types/state";
import { Logger } from "@/utils/services";
import { useCookies } from "react-cookie";
import * as S from "./styles";

type Props = {};

export const ThemeToggle: FC<Props> = ({ }) => {
  const [theme, set] = useStore<StoreState, "theme">((store) => store.theme);
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
            light: theme === "light",
            dark: theme === "dark",
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
