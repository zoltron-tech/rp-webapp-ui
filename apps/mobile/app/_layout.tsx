import {
  ApiProvider,
  ChatCryptoProvider,
  createQueryClient,
  useSession,
} from "@nw/features";
import {
  GlobalStoreContext,
  useGlobalStoreSet,
  useStoreData,
} from "@nw/store";
import type { StoreState } from "@nw/types/state";
import { setLogger } from "@nw/utils";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SchedulerHeartbeat } from "@/components/scheduler-heartbeat";
import { ChatSocketProvider } from "@/context/socket";
import { api, setSessionLostHandler } from "@/lib/api";
import { useEditorFonts } from "@/lib/editor-fonts";
import { chatCrypto } from "@/lib/chat-crypto";
import {
  PERSIST_MAX_AGE,
  persistBuster,
  purgePersistedQueries,
  queryPersister,
  shouldPersistQuery,
} from "@/lib/query-persister";
import { loadSession } from "@/lib/session-store";
import { AppThemeProvider, useTheme } from "@/theme";
import { ambientScreenLayout } from "@/components/ambient-background";

/**
 * The root of the native app — the counterpart to `apps/web/src/main.tsx`.
 *
 * The provider stack is deliberately the same shape and the same packages: the
 * global store, react-query, and an API client handed to `@nw/features` rather
 * than imported by it. Only the client differs (SecureStore bearer token
 * instead of cookies), which is the whole point of the seam.
 */

const queryClient = createQueryClient();

// A session the server refused (not a sign-out: the refresh token died) gets
// the same cleanup a sign-out does. Memory first — the persister writes the
// in-memory cache back to disk, so purging disk alone would be undone.
setSessionLostHandler(async () => {
  queryClient.clear();
  chatCrypto.reset();
  await purgePersistedQueries();
});

setLogger({
  debug: (...args) => __DEV__ && console.log("DEBUG:-", ...args),
  error: (...args) => console.error("ERROR:-", ...args),
  info: (...args) => __DEV__ && console.log("INFO:-", ...args),
  log: (...args) => __DEV__ && console.log("LOG:-", ...args),
  warn: (...args) => console.warn("WARN:-", ...args),
});

/**
 * Puts the resolved session into the global store.
 *
 * react-query owns the session; the store is what theming reads, because the
 * accent is a preference rather than server state and `useAppTheme` cannot
 * depend on a query. One small bridge rather than two sources of truth: the
 * query stays authoritative and the store is a projection of it.
 *
 * Without this the app renders jade for everyone, including novelists who
 * picked something else.
 */
const SessionStoreBridge = ({ children }: { children: React.ReactNode }) => {
  const { novelist, status, user } = useSession();
  const setGlobalState = useGlobalStoreSet();

  useEffect(() => {
    setGlobalState({
      authState:
        status === "loading"
          ? "LOADING"
          : status === "signed-in"
            ? "LOGGED_IN"
            : status === "onboarding"
              ? "UNINITIALIZED"
              : "LOGGED_OUT",
      novelist,
      // The account, which is where the accent actually lives. Without it
      // `useAccent` falls back to the novelist's palette — a different field,
      // on a different object, that the picker does not write.
      user,
    });
  }, [novelist, status, user, setGlobalState]);

  return <>{children}</>;
};

/** Mirrors the web app's `<StoreProvider storeId="global-store">`. */
const GlobalStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const store = useStoreData<StoreState>("global-store", {} as StoreState);
  return (
    <GlobalStoreContext.Provider value={store}>
      {children}
    </GlobalStoreContext.Provider>
  );
};

export default function RootLayout() {
  const theme = useTheme();

  // The editor's faces, for anything that draws saved rich text. Not
  // awaited — see `lib/editor-fonts.ts`.
  useEditorFonts();

  /**
   * The keychain read has to finish before the first request goes out —
   * otherwise `getToken()` returns null, a signed-in user's opening screen
   * 401s, and the refresh coordinator spends a token to recover from a race
   * that never needed to happen.
   */
  const [sessionLoaded, setSessionLoaded] = useState(false);

  useEffect(() => {
    void loadSession().finally(() => setSessionLoaded(true));
  }, []);

  if (!sessionLoaded) {
    return <View style={{ backgroundColor: theme.background, flex: 1 }} />;
  }

  return (
    <SafeAreaProvider>
      {/*
        The cache is restored from disk before anything renders against it, so
        a screen someone has already visited paints from what it knew rather
        than from a spinner. See `lib/query-persister.ts` for what is written —
        it is a whitelist, and chat is not on it.
      */}
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          buster: persistBuster,
          dehydrateOptions: { shouldDehydrateQuery: shouldPersistQuery },
          maxAge: PERSIST_MAX_AGE,
          persister: queryPersister,
        }}
      >
        <ApiProvider api={api}>
          <ChatCryptoProvider crypto={chatCrypto}>
            <GlobalStoreProvider>
            <SessionStoreBridge>
              {/* One theme object for the whole tree. It is read four to six
                  times per list row, and building it per call was the largest
                  fixed cost in a friends-list cell. */}
              <AppThemeProvider>
              {/* Inside the crypto provider because it decrypts every frame it
                  receives, and inside the store bridge because presence and
                  reconnection follow the session. */}
              <ChatSocketProvider>
              <SchedulerHeartbeat />
              <StatusBar style="auto" />
              <Stack
                screenLayout={ambientScreenLayout}
                screenOptions={{
                  contentStyle: { backgroundColor: theme.background },
                  headerShown: false,
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="novelists" />
                <Stack.Screen name="login" />
                {/* Its own stack: three steps that push, with the draft they
                    share held on that stack's layout. See `register/_layout`. */}
                <Stack.Screen name="register" />
                {/*
                  Frozen while a full screen covers it (the profile settings).
                  A theme change there re-renders every `useAppTheme` reader in
                  every visited tab; frozen, they catch up once, on the way
                  back, instead of stalling the picker. A transparent modal
                  (the menu) leaves the tabs active, so it is unaffected.
                */}
                <Stack.Screen name="(tabs)" options={{ freezeOnBlur: true }} />
                {/* Profile settings, opened from the menu. Outside the tabs:
                    see `app/edit-profile/_layout`. */}
                <Stack.Screen name="edit-profile" />
                {/* A character's settings, and "Add a new character". Outside
                    the tabs for the same reason: see `app/edit-muse/_layout`. */}
                <Stack.Screen name="edit-muse" />
                {/* Every story you can read, opened from the menu. */}
                <Stack.Screen name="library" />
                {/* A storyboard and its chapters, read. Its own stack: see
                    `app/story/_layout`. */}
                <Stack.Screen name="story" />
                {/*
                  Transparent, and animated by the screen itself: a native
                  modal has an opaque container, so dragging the sheet down
                  exposed a black box before the stack's own slide-out ran.
                  See `app/menu.tsx` for the slide in both directions.
                */}
                <Stack.Screen
                  name="menu"
                  options={{
                    animation: "none",
                    contentStyle: { backgroundColor: "transparent" },
                    presentation: "transparentModal",
                  }}
                />
              </Stack>
              </ChatSocketProvider>
              </AppThemeProvider>
            </SessionStoreBridge>
            </GlobalStoreProvider>
          </ChatCryptoProvider>
        </ApiProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
