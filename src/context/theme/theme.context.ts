import { createContext } from "react";

export type ThemeContextType = {
	theme: "light" | "dark";
	toggleTheme: () => void;
};

export const INITIAL_THEME_STATE: ThemeContextType = {
	theme: "dark",
	toggleTheme: () => {},
};

export const ThemeContext =
	createContext<ThemeContextType>(INITIAL_THEME_STATE);
