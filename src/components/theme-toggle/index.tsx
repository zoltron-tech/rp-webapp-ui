import { BsMoonFill, BsSunFill } from "react-icons/bs";
import classNames from "classnames";
import { FC } from "react";

import * as S from "./styles";
type Props = {
  toggleTheme: () => void;
  theme: "light" | "dark";
};

export const ThemeToggle: FC<Props> = ({ theme, toggleTheme }) => {
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
