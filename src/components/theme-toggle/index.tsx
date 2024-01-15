import { ThemeContext } from "@/context";
import { useContext, useEffect, useState } from "react";

import * as S from "./styles";
import { BsMoonFill, BsSunFill } from "react-icons/bs";
import { PALETTE } from "@/theme";
import classNames from "classnames";

const { THEME_SWITCHER } = PALETTE;

export const ThemeToggle = () => {
	const { theme, toggleTheme } = useContext(ThemeContext);
	const [isAnimating, setIsAnimating] = useState(false);

	useEffect(() => {
		setIsAnimating(true);
		const timeout = setTimeout(() => {
			setIsAnimating(false);
		}, 400);
	}, [theme]);

	return (
		<S.ThemeSwitcher onClick={toggleTheme}>
			<S.ThemeIconContainer>
				<BsSunFill
					color={
						theme === "light"
							? THEME_SWITCHER.SUN_COLOR
							: THEME_SWITCHER.OPTION_DISABLED
					}
				/>
			</S.ThemeIconContainer>
			<S.ThemeIconContainer>
				<BsMoonFill
					color={
						theme === "dark"
							? THEME_SWITCHER.MOON_COLOR
							: THEME_SWITCHER.OPTION_DISABLED
					}
				/>
			</S.ThemeIconContainer>
			<S.ThemeSwitchInner
				theme={theme}
				className={classNames({
					light: theme === "light",
					dark: theme === "dark",
				})}
			/>
		</S.ThemeSwitcher>
	);
};
