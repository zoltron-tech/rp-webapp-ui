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
		<S.ThemeSwitcher onClick={toggleTheme}>
			<S.ThemeIconContainer>
				<BsSunFill
					color={
						theme === "light"
							? S.THEME_SWITCHER.SUN_COLOR
							: S.THEME_SWITCHER.OPTION_DISABLED
					}
				/>
			</S.ThemeIconContainer>
			<S.ThemeIconContainer>
				<BsMoonFill
					color={
						theme === "dark"
							? S.THEME_SWITCHER.MOON_COLOR
							: S.THEME_SWITCHER.OPTION_DISABLED
					}
				/>
			</S.ThemeIconContainer>
			<S.ThemeSwitchInner
				className={classNames({
					light: theme === "light",
					dark: theme === "dark",
				})}
			/>
		</S.ThemeSwitcher>
	);
};
