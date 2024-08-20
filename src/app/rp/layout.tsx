"use client";

import { THEME_DARK, THEME_LIGHT } from "@/theme";
import {
  ContentContainer,
  Footer,
  LoginModal,
  TopBar,
} from "@/components/layout";
import { AuthProvider, StoreProvider, UIContextProvider } from "@/context";
import React, { useCallback, useMemo } from "react";
import { useCookies } from "react-cookie";
import { ThemeProvider } from "styled-components";

import { StoreState } from "@/types/state";
import * as S from "./styles";
import { usePathname } from "next/navigation";
import { ShouldRender } from "@/components/common";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [cookies, _setCookie] = useCookies(["theme"]);
  const theme = useMemo(() => {
    console.log("cookies.theme", cookies.theme);
    return cookies.theme === "light" ? THEME_LIGHT : THEME_DARK;
  }, [cookies.theme]);

  const pathname = usePathname();

  console.log("theme is", theme);
  console.log("path is", pathname);

  return (
    <ThemeProvider theme={theme}>
      <StoreProvider<StoreState>
        initial={{ novelists: [], theme: cookies.theme || "light", muses: [] }}
      >
        <AuthProvider>
          <UIContextProvider>
            <S.PageContainer>
              <ShouldRender
                if={
                  pathname !== "/rp/reset-password" &&
                  pathname !== "/rp/verify-email"
                }
              >
                <LoginModal />
                <TopBar />
              </ShouldRender>
              <ContentContainer>{children}</ContentContainer>
              <Footer />
            </S.PageContainer>
          </UIContextProvider>
        </AuthProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}
