"use client";

import { DefaultTheme } from "@novelist-world/ui";
import classNames from "classnames";
import type React from "react";
import { type FC, type HTMLProps, useEffect, useMemo } from "react";
import { useCookies } from "react-cookie";
import { ThemeProvider } from "styled-components";
import { ContentContainer, TopBar } from "@/components/layout";
import { AuthProvider, UIContextProvider } from "@/context";
import { StoreProvider } from "@/context/store/context";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { THEME_DARK, THEME_LIGHT } from "@/theme";
import type { StoreState } from "@/types/state";
import * as S from "./styles";

const ACCENT_MAP = {
  0: "jade",
  1: "crimson",
  2: "iris",
} as const;

const useAccent = () => {
  const user = useGlobalState("user");
  const setGlobalState = useGlobalStoreSet();
  const accent = useMemo(() => {
    if (!user?.palette || user.palette > 2) return ACCENT_MAP[0];
    const _accent = ACCENT_MAP[user.palette as 0 | 1 | 2] || ACCENT_MAP[0];
    return _accent;
  }, [user]);

  useEffect(() => {
    setGlobalState({ accent });
  }, [accent, setGlobalState]);

  return accent;
};

const PageContainer: FC<HTMLProps<HTMLDivElement>> = ({ children }) => {
  const accent = useAccent();
  const theme = useGlobalState("theme");

  return (
    <S.PageContainer
      className={classNames("page-container", theme, accent)}
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
          accent: "jade", // Default accent
          authState: "LOGGED_OUT",
          globalLoading: false,
          muses: [],
          novelist: null,
          novelists: [],
          theme: "dark",
          user: null,
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
