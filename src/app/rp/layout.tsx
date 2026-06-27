"use client";

import { DefaultTheme } from "@novelist-world/ui";
import classNames from "classnames";
import type React from "react";
import { type FC, type HTMLProps, useEffect, useMemo } from "react";
import { useCookies } from "react-cookie";
import { ThemeProvider } from "styled-components";
import {
  getConversationsAction,
  getGroupCountAction,
  getUnreadConversationIdsAction,
} from "@/app/rp/conversations/actions";
import { GlobalMusicPlayer } from "@/components/global-music-player";
import { InstallAppPrompt } from "@/components/install-app-prompt";
import { JoinDiscordPrompt } from "@/components/join-discord-prompt";
import { ContentContainer, TopBar } from "@/components/layout";
import {
  AuthProvider,
  MusicProvider,
  SocketProvider,
  UIContextProvider,
} from "@/context";
import { useSocket } from "@/context/socket";
import { StoreProvider } from "@/context/store/context";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { setBadgeCount } from "@/lib/badge-manager";
import { THEME_DARK, THEME_LIGHT } from "@/theme";
import type { StoreState } from "@/types/state";
import { ACCENT_MAP } from "@/types/theme";
import { getUnreadReplyCount } from "./outgoing-threads/actions";
import * as S from "./styles";

/**
 * Schedule non-critical background work for when the browser is idle so it
 * never contends with the auth-critical path or the initial render (which is
 * what makes the app feel "frozen" right after opening). Falls back to a
 * short timeout where requestIdleCallback is unavailable (e.g. Safari).
 */
type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

const runWhenIdle = (cb: () => void): (() => void) => {
  if (typeof window === "undefined") return () => {};
  const w = window as IdleWindow;
  if (typeof w.requestIdleCallback === "function") {
    const id = w.requestIdleCallback(cb, { timeout: 2000 });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(cb, 200);
  return () => window.clearTimeout(id);
};

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
  const setGlobalState = useGlobalStoreSet();
  const { lastIncomingMessage } = useSocket();
  const unreadConversationIds = useGlobalState("unreadConversationIds");
  const unreadReplyCount = useGlobalState("unreadReplyCount");
  const authState = useGlobalState("authState");

  // Prefetch the current group count after login so the create-group gate is ready
  useEffect(() => {
    if (authState !== "LOGGED_IN") return;
    return runWhenIdle(() => {
      getGroupCountAction().then((result) => {
        if (typeof result === "number") {
          setGlobalState({ groupCount: result });
        }
      });
    });
  }, [authState, setGlobalState]);

  useEffect(() => {
    if (!lastIncomingMessage) return;
    Promise.all([getUnreadConversationIdsAction(), getUnreadReplyCount()]).then(
      ([unreadIds, unreadReplyCount]) => {
        setGlobalState({
          unreadConversationIds: Array.isArray(unreadIds) ? unreadIds : [],
          unreadReplyCount:
            typeof unreadReplyCount === "number" ? unreadReplyCount : 0,
        });
      },
    );
    // Refresh the cached conversations list so the inbox stays up to date
    getConversationsAction(1, 15).then((result) => {
      if (result && Array.isArray(result)) {
        setGlobalState({ cachedConversations: result });
      }
    });
  }, [lastIncomingMessage, setGlobalState]);

  // In whatever component/hook owns your global state
  // e.g. your GlobalStateProvider or root layout

  useEffect(() => {
    const unreadCount =
      (unreadConversationIds?.length ?? 0) + (unreadReplyCount ?? 0);
    setBadgeCount(unreadCount);
  }, [unreadConversationIds, unreadReplyCount]);

  useEffect(() => {
    if (authState !== "LOGGED_IN") return;
    return runWhenIdle(() => {
      const queries = ["hello", "wave"];
      const q = queries[Math.floor(Math.random() * queries.length)];
      fetch(`/api/klipy-stickers?q=${encodeURIComponent(q)}&limit=20`)
        .then((r) => r.json())
        .then(
          (data: { items: { stickerUrl: string; previewUrl: string }[] }) => {
            if (data.items?.length) {
              setGlobalState({ helloStickers: data.items });
            }
          },
        )
        .catch(() => {
          /* non-critical */
        });
    });
  }, [authState, setGlobalState]);

  return (
    <S.PageContainer
      className={classNames("page-container", theme, accent)}
      data-accent={accent}
    >
      <TopBar />
      <GlobalMusicPlayer />
      <InstallAppPrompt />
      <JoinDiscordPrompt />
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
          activeConversation: null,
          activePrompt: null,
          authState: "LOGGED_OUT",
          cachedConversations: null,
          cachedExplorePrompts: null,
          cachedOutgoingThreads: null,
          cachedHomeActivities: null,
          cachedOOCPosts: null,
          cachedPromptComments: null,
          conversationNavDirection: null,
          friendSuggestions: null,
          groupCount: null,
          helloStickers: null,
          justOnboarded: false,
          lastReadConversationId: null,
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
          showInstallAppPrompt: false,
          showJoinDiscordPrompt: false,
          theme: "dark",
          unreadConversationIds: null,
          unreadReplyCount: null,
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
