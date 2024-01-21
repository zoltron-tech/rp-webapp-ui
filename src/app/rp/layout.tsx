"use client";

import React from "react";

import { ContentContainer, LoginModal, TopBar } from "@/components";
import { UIContextProvider } from "@/context";
import { THEME_DARK, THEME_LIGHT } from "@/theme";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { ThemeProvider } from "styled-components";

import * as S from "./styles";

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

  if (!initialized) return <S.FallbackContainer></S.FallbackContainer>;

  return (
    <UIContextProvider>
      <ThemeProvider theme={getTheme()}>
        <LoginModal />
        <TopBar theme={theme} toggleTheme={toggleTheme} />
        <main>
          <ContentContainer>{children}</ContentContainer>
        </main>
      </ThemeProvider>
    </UIContextProvider>
  );
}
