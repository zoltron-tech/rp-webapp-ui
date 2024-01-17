"use client";

import React from "react";

import { ContentContainer, TopBar } from "@/components";
import { UIContextProvider } from "@/context";
import { ThemeProvider } from "styled-components";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { THEME_DARK, THEME_LIGHT } from "@/theme";

export default function Layout({ children }: { children: React.ReactNode }) {
	const [cookies, setCookie] = useCookies(["theme"]);
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
