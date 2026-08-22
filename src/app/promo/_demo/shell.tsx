"use client";

import { DefaultTheme } from "@novelist-world/ui";
import type { StoreState } from "@nw/types/state";
import type { FC, ReactNode } from "react";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import * as DialogS from "@/components/dialog/styled";
import { StoreProvider } from "@/context/store/context";
import { UIContextProvider } from "@/context/ui";
import { THEME_DARK } from "@/theme";

/**
 * Everything the storyboard components need from the app shell, and nothing
 * else.
 *
 * `app/rp/layout.tsx` wraps its pages in AuthProvider, SocketProvider and a
 * MusicProvider as well — all three open connections, and the promo capture
 * runs with the network cut off. What is left is what the views actually read
 * from: the styled-components theme, the global store (theme + accent), and the
 * toast context the codex calls into on save paths the scene never takes.
 */

/**
 * A transparent page.
 *
 * `globals.css` paints `body` black, which would end up baked into every
 * captured frame. Clearing it is what lets the capture screenshot with
 * `omitBackground` and get real alpha around the frame's edges.
 */
const PromoGlobalStyle = createGlobalStyle`
  html, body {
    background: transparent !important;
    background-color: transparent !important;
    overflow: hidden;
  }

  /* The scene is stepped frame by frame; any transition of the components'
     own would smear across a capture that is not running in real time. */
  * {
    transition: none !important;
    animation: none !important;
    /* Drop shadows fall onto the transparent background as wide, faint alpha.
       GIF has one bit of transparency, so that gradient cannot survive: it is
       either cut away (and the shadow is gone anyway) or forced opaque (a hard
       black slab around every panel). Removing them lets the alpha cutoff be
       set low enough to keep anti-aliased text solid — see alphaThreshold in
       promo-gif/config.mjs. */
    box-shadow: none !important;
  }

  /* The confirm dialog's scrim covers the whole viewport at 60% black. On an
     opaque page that reads as depth; on a transparent one, one-bit alpha turns
     it into a solid slab over every pixel of the frame. The dialog itself
     paints its own surface, so it still reads without it. */
  ${DialogS.Overlay} {
    background: transparent !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
`;

/** The store shape `app/rp/layout.tsx` starts from, with the promo signed in so
 *  the workspace renders its authoring chrome. */
const INITIAL_STATE: StoreState = {
  accent: "jade",
  activeConversation: null,
  activePrompt: null,
  authState: "LOGGED_IN",
  cachedConversations: null,
  cachedExplorePrompts: null,
  cachedHomeActivities: null,
  cachedOOCPosts: null,
  cachedOutgoingThreads: null,
  cachedPromptComments: null,
  conversationNavDirection: null,
  friendSuggestions: null,
  groupCount: null,
  helloStickers: null,
  hideAppSidebars: true,
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
  novelistRank: null,
  novelists: [],
  pageLoading: false,
  searchBarExpanded: false,
  showInstallAppPrompt: false,
  showJoinDiscordPrompt: false,
  theme: "dark",
  unreadConversationIds: null,
  unreadReplyCount: null,
  user: null,
};

export const PromoShell: FC<{ children: ReactNode }> = ({ children }) => (
  <ThemeProvider theme={{ ...THEME_DARK, ...DefaultTheme }}>
    <PromoGlobalStyle />
    <StoreProvider<StoreState> storeId="global-store" initial={INITIAL_STATE}>
      <UIContextProvider>{children}</UIContextProvider>
    </StoreProvider>
  </ThemeProvider>
);
