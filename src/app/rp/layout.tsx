"use client";

import React from "react";

import {
  ContentContainer,
  Footer,
  LoginModal,
  TopBar,
} from "@/components/layout";
import { AuthProvider, StoreProvider, UIContextProvider } from "@/context";
import { THEME_DARK, THEME_LIGHT } from "@/theme";
import { useCookies } from "react-cookie";
import { ThemeProvider } from "styled-components";

import { SocketProvider } from "@/context/socket";
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
          <SocketProvider>
            <UIContextProvider>
              <S.PageContainer>
                <LoginModal />
                <TopBar />
                <ContentContainer>{children}</ContentContainer>
                <Footer />
              </S.PageContainer>
            </UIContextProvider>
          </SocketProvider>
        </AuthProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}
