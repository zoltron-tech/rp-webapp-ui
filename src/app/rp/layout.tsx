"use client";

import { THEME_DARK, THEME_LIGHT } from "@/theme";
import { ContentContainer, TopBar } from "@/components/layout";
import { AuthProvider, UIContextProvider } from "@/context";
import React, { FC, HTMLProps, useMemo } from "react";
import { useCookies } from "react-cookie";
import { ThemeProvider } from "styled-components";

import { StoreState } from "@/types/state";
import * as S from "./styles";
import { DefaultTheme } from "@novelist-world/ui";
import { StoreProvider } from "@/context/store/context";
import { useGlobalState } from "@/context/store/stores";
import classNames from "classnames";

const ACCENT_MAP = {
  0: "jade",
  1: "crimson",
  2: "iris",
};

const PageContainer: FC<HTMLProps<HTMLDivElement>> = ({ children }) => {
  const user = useGlobalState("user");
  const accent = useMemo(() => {
    if (!user?.palette || user.palette > 2) return ACCENT_MAP[0];
    const _accent = ACCENT_MAP[user.palette as 0 | 1 | 2] || ACCENT_MAP[0];
    return _accent;
  }, [user]);

  return (
    <S.PageContainer
      className={classNames("page-container", "dark", accent)}
      data-accent={accent}
    >
      <TopBar />
      <ContentContainer>{children}</ContentContainer>
    </S.PageContainer>
  );
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const [cookies, _setCookie] = useCookies(["theme"]);
  const theme = useMemo(() => {
    return cookies.theme === "light" ? THEME_LIGHT : THEME_DARK;
  }, [cookies.theme]);

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
          globalLoading: false,
        }}
      >
        <AuthProvider>
          <UIContextProvider>
            <PageContainer>{children}</PageContainer>
          </UIContextProvider>
        </AuthProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}
