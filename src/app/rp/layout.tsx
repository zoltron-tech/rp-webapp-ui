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

import { StoreState } from "@/types/state";
import * as S from "./styles";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [cookies, _setCookie] = useCookies(["theme"]);

  const getTheme = () => {
    return cookies.theme === "light" ? THEME_LIGHT : THEME_DARK;
  };

  return (
    <ThemeProvider theme={getTheme()}>
      <StoreProvider<StoreState>
        initial={{ novelists: [], theme: cookies.theme || "light" }}
      >
        <AuthProvider>
          <UIContextProvider>
            <S.PageContainer>
              <LoginModal />
              <TopBar />
              <ContentContainer>{children}</ContentContainer>
              <Footer />
            </S.PageContainer>
          </UIContextProvider>
        </AuthProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}
