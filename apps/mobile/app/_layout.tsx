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
import { KeyboardProvider } from "react-native-keyboard-controller";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { OfflineBanner } from "@/components/offline-banner";
import {
  ActivityCapture,
  noteActivity,
  SchedulerHeartbeat,
} from "@/components/scheduler-heartbeat";
import { ChatSocketProvider } from "@/context/socket";
import { OutboxDrain } from "@/hooks/use-outbox-drain";
import { setKeyboardNavigationInset } from "@/hooks/use-keyboard-height";
import { api, setSessionLostHandler } from "@/lib/api";
import { startConnectivity } from "@/lib/connectivity";
import { useEditorFonts } from "@/lib/editor-fonts";
import { chatCrypto } from "@/lib/chat-crypto";
import {
  PERSIST_MAX_AGE,
  persistBuster,
  purgePersistedQueries,
  queryPersister,
  shouldPersistQuery,
} from "@/lib/query-persister";
import {
  bindStore,
  isBackgroundRefreshRunning,
  readActiveUser,
  wipeCurrentStore,
  wipeEverything,
  wipeOtherStores,
} from "@/lib/local-store";
import {
  loadSession,
  readAccessToken,
  setFreshInstallHandler,
} from "@/lib/session-store";
import { loadUiFonts } from "@/lib/ui-fonts";
import { AppThemeProvider, useAppTheme, useTheme } from "@/theme";
import { glassHeaderOptions } from "@/theme/header";
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

/*
 * Freshness windows for what the local store hydrates (LOCAL_DATA_PLAN.md
 * 4.1). The shared hooks carry no `staleTime` of their own for these, so the
 * client's default (60 s) applied; hydrated from disk, that would refetch the
 * inbox on every open. Five minutes, and the reconcile on focus (see
 * `hooks/use-reconcile.ts`) is what catches deletions inside the window.
 */
// A query landing — a fetch, a socket message written into the cache — is
// work React has to paint; it buys the heartbeat a short fast window.
queryClient.getQueryCache().subscribe((event) => {
  // Only data arriving: an observer (a `useQuery`) re-rendering with new
  // options is a render that already happened, not one waiting to.
  if (event.type === "updated" || event.type === "added") noteActivity("data");
});
queryClient.setQueryDefaults(["conversations"], { staleTime: 5 * 60 * 1000 });
queryClient.setQueryDefaults(["notifications"], { staleTime: 5 * 60 * 1000 });
queryClient.setQueryDefaults(["thread"], { staleTime: 5 * 60 * 1000 });
queryClient.setQueryDefaults(["outgoing-threads"], { staleTime: 5 * 60 * 1000 });

// A session the server refused (not a sign-out: the refresh token died) gets
// the same cleanup a sign-out does. Memory first — the persister writes the
// in-memory cache back to disk, so purging disk alone would be undone.
// A reinstall: the keychain outlived the app (iOS) and must be cleared before
// anything reads it — files, media, keys, register, marker. See
// `session-store.ts`; registered here rather than imported there, because the
// session module is loaded by the background task's entry and must not pull
// the store in behind it.
setFreshInstallHandler(wipeEverything);

// The network's state, into react-query (fetches pause rather than fail while
// the phone is offline) and into the screens' offline notices. Before any
// query runs, so the first one on a phone in a tunnel waits instead of failing.
startConnectivity();

setSessionLostHandler(async () => {
  queryClient.clear();
  chatCrypto.reset();
  await purgePersistedQueries();
  // Not from under a background run: the file is the foreground's to judge,
  // the next time it sees the 401 for itself (`local-store/background.ts`).
  if (!isBackgroundRefreshRunning()) await wipeCurrentStore();
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

  /*
   * The local database follows the session: opened for the novelist once the
   * server has said who that is, switched when a different account signs in.
   * It is not closed on sign-out here — `useSignOut` wipes it, which is the
   * stronger of the two, and the session-lost handler above does the same.
   */
  useEffect(() => {
    if (status !== "signed-in" || !novelist?.id) return;
    const id = novelist.id;
    void wipeOtherStores(id).then(() => bindStore(id, queryClient));
  }, [novelist?.id, status]);

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

/**
 * Tells the keyboard store how tall the navigation bar is.
 *
 * The store is a module, not a component, and cannot read the safe area for
 * itself. See `use-keyboard-height.ts` for why it needs the number.
 */
const KeyboardInsetBridge = () => {
  const { bottom } = useSafeAreaInsets();

  useEffect(() => {
    setKeyboardNavigationInset(bottom);
  }, [bottom]);

  return null;
};

/**
 * The root stack, and the offline strip that floats over it.
 *
 * Its own component so it can read `useAppTheme` — the route-level header
 * options below need the glass tokens, which the base `useTheme` the layout
 * holds does not carry.
 */
const RootStack = () => {
  const theme = useAppTheme();

  return (
    <>
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
        {/* The reset-link request, native: see `app/forgot-password`. */}
        <Stack.Screen name="forgot-password" />
        {/* Its own stack: three steps that push, with the draft they
            share held on that stack's layout. See `register/_layout`. */}
        <Stack.Screen name="register" />
        {/* The profile set-up after signup and the prompts that follow it;
            its own stack, see `app/onboarding/_layout`. */}
        <Stack.Screen name="onboarding" />
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
        {/* Every story you can read, opened from the menu. Header declared
            here for the reason given on `outbox`. */}
        <Stack.Screen
          name="library"
          options={{
            headerShown: true,
            ...glassHeaderOptions(theme),
            title: "Library",
          }}
        />
        {/* Messages waiting for a connection; from the menu and the
            offline strip. Its header is declared here rather than from
            inside the screen — see `screens/outbox.tsx`. */}
        <Stack.Screen
          name="outbox"
          options={{
            headerShown: true,
            ...glassHeaderOptions(theme),
            title: "Outbox",
          }}
        />
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
      {/* After the stack, so it floats over every screen's top bar. */}
      <OfflineBanner />
    </>
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
    // The interface faces load alongside it: both are short, and a first
    // frame drawn before either would have to be drawn again.
    void Promise.all([
      /*
       * The last account's store, before the server has confirmed the
       * session — but only behind its token. The marker names the account
       * whose store is on disk; the keychain says whether anyone is still
       * signed in as them. A marker without a token is a session that ended
       * while the app was away (a background run saw the refusal, a crash,
       * a keychain the OS reset), and the store is wiped rather than shown to
       * whoever opens the app next. A token the server then rejects goes
       * through the session-lost handler, which wipes it too.
       */
      loadSession().then(async () => {
        const id = await readActiveUser();
        if (!id) return;
        if (readAccessToken()) await bindStore(id, queryClient);
        else await wipeCurrentStore();
      }),
      loadUiFonts(),
    ]).finally(() => setSessionLoaded(true));
  }, []);

  if (!sessionLoaded) {
    return <View style={{ backgroundColor: theme.background, flex: 1 }} />;
  }

  return (
    <SafeAreaProvider>
      <KeyboardInsetBridge />
      {/*
        Where the keyboard is, frame by frame, from the window's own inset
        animation — what every bar that sits on the keyboard is moved by.
      */}
      <KeyboardProvider>
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
              {/* Messages written offline, sent the moment the socket is back. */}
              <OutboxDrain />
              <StatusBar style="auto" />
              {/* Every touch in the app is a sign of life for the heartbeat. */}
              <ActivityCapture>
                <RootStack />
              </ActivityCapture>
              </ChatSocketProvider>
              </AppThemeProvider>
            </SessionStoreBridge>
            </GlobalStoreProvider>
          </ChatCryptoProvider>
        </ApiProvider>
      </PersistQueryClientProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
