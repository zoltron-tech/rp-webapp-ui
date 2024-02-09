"use client";

import React, { useRef } from "react";

import {
  ContentContainer,
  Footer,
  LoginModal,
  TopBar,
} from "@/components/layout";
import { AuthProvider, StoreProvider, UIContextProvider } from "@/context";
import { THEME_DARK, THEME_LIGHT } from "@/theme";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { ThemeProvider } from "styled-components";

import { Novelist } from "@/types";
import * as S from "./styles";

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
      <StoreProvider<{ novelists: Novelist[] }> initial={{ novelists: [] }}>
        <AuthProvider>
          <UIContextProvider>
            <S.PageContainer>
              <LoginModal />
              <TopBar theme={theme} toggleTheme={toggleTheme} />
              <ContentContainer>{children}</ContentContainer>
              <Footer />
            </S.PageContainer>
          </UIContextProvider>
        </AuthProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}
