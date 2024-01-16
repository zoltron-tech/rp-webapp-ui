"use client";

import { ContentContainer, TopBar } from "@/components";
import { UIContextProvider } from "@/context";
import { ThemeProvider } from "styled-components";
import { useEffect, useState } from "react";
import { pSBC } from "@/lib/pSBC";
import { useCookies } from "react-cookie";

import React from "react";

type Theme = {
	background: string;
	text: string;
	primary: string;
	navbar: string;
	cardBackgroundTint: string;
	cardBackgroundGradient: string[];
	hoverGrey: string;
	hoverGreyAlpha: string;
	danger: string;
};

const accentColor = "#0c6648";

const THEME_LIGHT: Theme = {
	background: "#aeaeae",
	text: "#000",
	primary: pSBC(0.1, accentColor) as string,
	navbar: pSBC(0.6, accentColor) as string,
	cardBackgroundTint: "rgba(185, 182, 182, 0.003)",
	cardBackgroundGradient: [
		"rgba(0, 0, 0, 0)",
		"rgba(208, 208, 208, 0.546) 40%",
		"#dedede",
	],
	hoverGrey: "#e6e6e6",
	hoverGreyAlpha: "rgba(230, 230, 230, 0.5)",
	danger: "#ff0000",
};

const THEME_DARK: Theme = {
	background: "#232323",
	text: "#fff",
	primary: pSBC(-0.5, accentColor) as string,
	navbar: "#474646",
	cardBackgroundTint: "rgba(0, 0, 0, 0.339)",
	cardBackgroundGradient: [
		"rgba(255, 255, 255, 0)",
		"rgba(0, 0, 0, 0.8) 60%",
		"rgba(0, 0, 0, 1)",
	],
	hoverGrey: "#333333",
	hoverGreyAlpha: "rgba(51, 51, 51, 0.5)",
	danger: "#ff0000",
};

export default function Layout({ children }: { children: React.ReactNode }) {
	const [cookies, setCookie, removeCookie] = useCookies(["theme"]);
	const [theme, setTheme] = useState<"light" | "dark">("dark");
	const [initialized, setInitialized] = useState(false);

	const toggleTheme = () => {
		setTheme((current) => {
			const newTheme = current === "light" ? "dark" : "light";
			setCookie("theme", newTheme);
			return newTheme;
		});
	};

	const getTheme = () => {
		return theme === "light" ? THEME_LIGHT : THEME_DARK;
	};

	useEffect(() => {
		if (initialized) return;
		setInitialized(true);
		setTheme(cookies.theme || "dark");
	}, [initialized]);

	console.log(cookies);

	if (!initialized) return <></>;

	return (
		<UIContextProvider>
			<ThemeProvider theme={getTheme()}>
				<TopBar theme={theme} toggleTheme={toggleTheme} />
				<ContentContainer>{children}</ContentContainer>
			</ThemeProvider>
		</UIContextProvider>
	);
}
