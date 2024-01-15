import { FC, useState } from "react";
import {
	INITIAL_THEME_STATE,
	ThemeContext,
	ThemeContextType,
} from "./theme.context";

type Props = {
	children: React.ReactNode;
};
export const ThemeProvider: FC<Props> = ({ children }) => {
	const [theme, setTheme] = useState<ThemeContextType["theme"]>(
		INITIAL_THEME_STATE.theme
	);

	const toggleTheme: ThemeContextType["toggleTheme"] = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	const contextValue = {
		theme,
		toggleTheme,
	};

	return (
		<ThemeContext.Provider value={contextValue}>
			{children}
		</ThemeContext.Provider>
	);
};
