"use client";

import { DefaultTheme } from "@novelist-world/ui";
import classNames from "classnames";
import type React from "react";
import { type FC, type HTMLProps, useEffect, useMemo } from "react";
import { useCookies } from "react-cookie";
import { ThemeProvider } from "styled-components";
import { GlobalMusicPlayer } from "@/components/global-music-player";
import { ContentContainer, TopBar } from "@/components/layout";
import { AuthProvider, MusicProvider, SocketProvider, UIContextProvider } from "@/context";
import { StoreProvider } from "@/context/store/context";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { THEME_DARK, THEME_LIGHT } from "@/theme";
import type { StoreState } from "@/types/state";
import { ACCENT_MAP } from "@/types/theme";
import * as S from "./styles";

const useAccent = () => {
  const user = useGlobalState("user");
  const setGlobalState = useGlobalStoreSet();
  const accent = useMemo(() => {
    if (typeof user?.palette === "undefined" || user.palette > 3)
      return ACCENT_MAP[0];
    const _accent = ACCENT_MAP[user.palette] || ACCENT_MAP[0];
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
      <GlobalMusicPlayer />
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
          muses: [],
          musicPlayer: {
            currentTime: 0,
            duration: 0,
            playingSongId: null,
            playingSongName: null,
            playingSongUrl: null,
            progress: 0,
          },
          notifications: null,
          novelist: null,
          novelists: [],
          pageLoading: false,
          searchBarExpanded: false,
          theme: "dark",
          user: null,
        }}
      >
        <AuthProvider>
          <SocketProvider>
            <UIContextProvider>
              <MusicProvider>
                <PageContainer>{children}</PageContainer>
              </MusicProvider>
            </UIContextProvider>
          </SocketProvider>
        </AuthProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}
