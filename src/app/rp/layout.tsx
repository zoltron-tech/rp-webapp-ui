"use client";
import React, { useRef } from "react";

import { ContentContainer, LoginModal, TopBar } from "@/components";
import { AuthProvider, UIContextProvider } from "@/context";
import { THEME_DARK, THEME_LIGHT } from "@/theme";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { ThemeProvider } from "styled-components";

export default function Layout({ children }: { children: React.ReactNode }) {
  const initialRender = useRef(true);
  const [cookies, setCookie] = useCookies(["theme"]);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

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
    if (!initialRender.current) return;
    initialRender.current = false;
    setTheme(cookies.theme || "dark");
  }, []);

  return (
    <ThemeProvider theme={getTheme()}>
      <AuthProvider>
        <UIContextProvider>
          <LoginModal />
          <TopBar theme={theme} toggleTheme={toggleTheme} />
          <main>
            <ContentContainer>{children}</ContentContainer>
          </main>
        </UIContextProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
