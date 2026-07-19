// Preview provider for design-sync cards. Mirrors src/app/rp/layout.tsx:
// styled-components ThemeProvider + global StoreProvider + app context
// providers + the themed wrapper div carrying the `.dark .jade` token classes.
import { DefaultTheme } from "@novelist-world/ui";
import type React from "react";
import { ThemeProvider } from "styled-components";
import {
  AuthProvider,
  MusicProvider,
  SocketProvider,
  UIContextProvider,
} from "@/context";
import { StoreProvider } from "@/context/store/context";
import { THEME_DARK } from "@/theme";
import type { StoreState } from "@/types/state";

const initialState: StoreState = {
  accent: "jade",
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
} as StoreState;

export const DSProvider = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={{ ...THEME_DARK, ...DefaultTheme }}>
    <StoreProvider<StoreState> storeId="global-store" initial={initialState}>
      <AuthProvider>
        <SocketProvider>
          <UIContextProvider>
            <MusicProvider>
              <div
                className="page-container dark jade"
                data-accent="jade"
                style={{
                  background: "var(--bg-1, #111210)",
                  color: "var(--text, #eceeed)",
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                {children}
              </div>
            </MusicProvider>
          </UIContextProvider>
        </SocketProvider>
      </AuthProvider>
    </StoreProvider>
  </ThemeProvider>
);
