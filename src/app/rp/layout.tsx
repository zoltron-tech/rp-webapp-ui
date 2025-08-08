"use client";

import { THEME_DARK, THEME_LIGHT } from "@/theme";
import { ContentContainer, TopBar } from "@/components/layout";
import { AuthProvider, UIContextProvider } from "@/context";
import React, { useMemo } from "react";
import { useCookies } from "react-cookie";
import { ThemeProvider } from "styled-components";

import { StoreState } from "@/types/state";
import * as S from "./styles";
import { usePathname } from "next/navigation";
import { DefaultTheme } from "@novelist-world/ui";
import { StoreProvider } from "@/context/store/context";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [cookies, _setCookie] = useCookies(["theme"]);
  const theme = useMemo(() => {
    return cookies.theme === "light" ? THEME_LIGHT : THEME_DARK;
  }, [cookies.theme]);

  const pathname = usePathname();

  return (
    <ThemeProvider theme={{ ...theme, ...DefaultTheme }}>
      <StoreProvider<StoreState>
        storeId="global-store"
        initial={{
          novelists: [],
          theme: cookies.theme || "light",
          muses: [],
          authState: "LOGGED_OUT",
          user: null,
          novelist: null,
        }}
      >
        <AuthProvider>
          <UIContextProvider>
            <S.PageContainer>
              <TopBar />
              <ContentContainer>{children}</ContentContainer>
            </S.PageContainer>
          </UIContextProvider>
        </AuthProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}
