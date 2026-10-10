import { getWebSocketTicket } from "@nw/api/endpoints/account";
import {
  createHeartbeatPong,
  createHeartbeatQuery,
  isServerNotification,
  createMessageSocketMessage,
  createReactionSocketMessage,
  HEARTBEAT_TIMEOUT_MS,
  isServerEdit,
  isServerMessage,
  isServerPing,
  isServerReaction,
  type OutgoingMessagePayload,
  parseSocketFrame,
  type ReactionPayload,
} from "@nw/chat";
import { queryKeys, useApi, useChatCrypto, useSession } from "@nw/features";
import type { Message } from "@nw/types";
import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AppState, type AppStateStatus } from "react-native";
import { env } from "@/lib/env";
import { registerForPush } from "@/lib/push";

/**
 * The chat-server socket, for the native app.
 *
 * The counterpart to `apps/web/src/context/socket/socket.provider.tsx`, and
 * deliberately not shared with it. What *is* shared is the part that has to
 * agree — every frame, in `@nw/chat`. What differs is policy, and it differs
 * because the platforms differ: a browser tab is either visible or hidden and
 * the user is generating mouse events all the while, whereas an app is
 * backgrounded by the OS, has its socket killed without a close frame, and
 * comes back with no events at all until someone touches the screen.
 *
 * So: `AppState` rather than `visibilitychange`, and a backoff-driven reconnect
 * rather than web's "any click re-checks the connection". Android in particular
 * will drop a socket during doze and never tell the app; a foreground
 * transition is the only reliable moment to notice.
 *
 * Incoming messages are written straight into the react-query cache rather than
 * pushed through React state. The cache is what every chat screen already
 * renders from, so a socket delivery and a polled refetch land in exactly the
 * same place — there is no second source of truth to reconcile, and no screen
 * has to subscribe to both.
 */

// ─── Reconnect policy ────────────────────────────────────────────────────────

/**
 * Backoff between reconnect attempts, in ms.
 *
 * The socket costs a ticket round-trip per attempt, so retrying tightly is a
 * request storm against `/account/ws-ticket` from every phone that lost signal
 * in the same tunnel. It tops out at 30s: past that a person has usually put
 * the app away, and the foreground transition reconnects immediately anyway.
 */
const BACKOFF_MS = [1_000, 2_000, 5_000, 10_000, 30_000] as const;

/** Debounce on `ensureConnected`, so bursts of callers open one socket. */
const CONNECT_DEBOUNCE_MS = 300;

/**
 * An unset `EXPO_PUBLIC_SOCKET_URL` disables chat delivery and presence, and it
 * does so quietly: every avatar is grey, messages arrive on the eight-second
 * poll, and nothing anywhere says why. Say it once, in development.
 */
let warnedAboutMissingUrl = false;

/**
 * Normalises the configured socket URL to a `ws://` or `wss://` one.
 *
 * The web app passes `VITE_SOCKET_URL` — an `https://` URL today — straight to
 * `new WebSocket(...)`, and a browser accepts that: the WHATWG spec has allowed
 * http/https there since 2022 and normalises it internally.
 *
 * React Native does not share that constructor. Android's goes to OkHttp, which
 * is happy with http/https; iOS's goes to `NSURLSessionWebSocketTask`, which
 * wants ws/wss and fails on anything else. Normalising here means one value in
 * `.env` works on both platforms and matches the web build byte for byte, which
 * is what stops someone maintaining two subtly different URLs.
 */
const toWebSocketUrl = (url: string): string =>
  url.replace(/^http:\/\//i, "ws://").replace(/^https:\/\//i, "wss://");

// ─── Presence ────────────────────────────────────────────────────────────────

/**
 * Who is online, as a store rather than a context value.
 *
 * Presence *was* a `string[]` on `ChatSocketValue`, and that array is replaced
 * on every server ping — roughly every thirty seconds. A new array is a new
 * context value, and a new context value re-renders every consumer: on the
 * friends list that is every `Avatar`, every `NovelistRow` around one, straight
 * through `memo`, because a context update is not something `memo` can stop.
 * Eight rows of four faces repainted, twice a minute, to change nothing.
 *
 * So presence is subscribed *per username*. `useIsOnline("ada")` is woken when
 * Ada connects or disconnects and at no other time, which is the only thing it
 * ever needed to know. The rest of the list holds still.
 *
 * The store is deliberately not React state. `useSyncExternalStore` reads
 * through it, so a ping mutates a `Set` and notifies exactly the names whose
 * answer changed — there is no render of the provider at all.
 */
interface PresenceStore {
  /** Watches one username. Returns the unsubscribe. */
  subscribe: (username: string, onChange: () => void) => () => void;
  isOnline: (username: string) => boolean;
  /** The server's whole answer, replacing the last one. */
  replace: (usernames: string[]) => void;
  /**
   * Who *you* are, and whether your socket is up.
   *
   * A special case, and the same one the web app makes: the server does not
   * report you back in your own heartbeat answer, so an open socket is the
   * proof. Without this your own avatar is the only grey one on screen.
   */
  setSelf: (username: string | null, connected: boolean) => void;
}

const createPresenceStore = (): PresenceStore => {
  const online = new Set<string>();
  const listeners = new Map<string, Set<() => void>>();
  let self: string | null = null;
  let selfConnected = false;

  const notify = (username: string) => {
    const subscribers = listeners.get(username);
    if (!subscribers) return;
    for (const callback of subscribers) callback();
  };

  return {
    isOnline: (username) =>
      username === self ? selfConnected : online.has(username),

    replace: (usernames) => {
      const next = new Set(usernames);
      // Only the difference is notified. A ping that says the same thing as the
      // last one — which is most of them — wakes nobody.
      for (const username of next) {
        if (!online.has(username)) notify(username);
      }
      for (const username of online) {
        if (!next.has(username)) notify(username);
      }
      online.clear();
      for (const username of next) online.add(username);
    },

    setSelf: (username, connected) => {
      if (username === self && connected === selfConnected) return;
      const previous = self;
      self = username;
      selfConnected = connected;
      if (previous && previous !== username) notify(previous);
      if (username) notify(username);
    },

    subscribe: (username, onChange) => {
      let subscribers = listeners.get(username);
      if (!subscribers) {
        subscribers = new Set();
        listeners.set(username, subscribers);
      }
      subscribers.add(onChange);

      return () => {
        subscribers.delete(onChange);
        if (subscribers.size === 0) listeners.delete(username);
      };
    },
  };
};

/**
 * Its own context, and one that never changes identity — the store is created
 * once and mutated in place, so nothing re-renders because presence moved.
 */
const PresenceContext = createContext<PresenceStore>(createPresenceStore());

// ─── Context ─────────────────────────────────────────────────────────────────

interface ChatSocketValue {
  isConnected: boolean;
  /** Opens the socket if it is closed. No-op when connected or signed out. */
  ensureConnected: () => void;
  /**
   * Sends a chat message over the socket.
   *
   * Returns false when there is no open socket, which is the caller's cue to
   * fall back to the REST endpoint. Worth being explicit about the difference:
   * a socket send is persisted *and broadcast* by chat-server, so everyone else
   * in the conversation sees it immediately. The REST endpoint only persists —
   * other clients will not see it until they next poll or reconnect.
   */
  sendMessage: (payload: OutgoingMessagePayload) => boolean;
  /**
   * Sends a reaction to a message.
   *
   * Socket-only, and returns false when there is none. Unlike a message there
   * is no REST endpoint to fall back to — the backend has no "add reaction"
   * route, chat-server owns the whole flow — so a caller that gets false must
   * not pretend the reaction landed. The screens hide the control instead of
   * offering one that silently does nothing.
   */
  sendReaction: (payload: ReactionPayload) => boolean;
  /**
   * Registers usernames to ask the server about, and unregisters on cleanup.
   *
   * The server answers strictly about the last list it was given, so this is
   * not optional bookkeeping: a screen that shows avatars and does not register
   * them shows every one of them as offline.
   */
  trackUsernames: (key: string, usernames: string[]) => () => void;
}

const ChatSocketContext = createContext<ChatSocketValue>({
  ensureConnected: () => {},
  isConnected: false,
  sendMessage: () => false,
  sendReaction: () => false,
  trackUsernames: () => () => {},
});

/** Whether the app is in front of the person right now. */
const isAppActive = () => AppState.currentState === "active";

export const useChatSocket = (): ChatSocketValue =>
  useContext(ChatSocketContext);

// ─── Provider ────────────────────────────────────────────────────────────────

export const ChatSocketProvider = ({ children }: { children: ReactNode }) => {
  const api = useApi();
  const crypto = useChatCrypto();
  const queryClient = useQueryClient();
  const { novelist, status } = useSession();

  const [isConnected, setIsConnected] = useState(false);

  /** Created once. Every write below goes through it rather than through state. */
  const presenceRef = useRef<PresenceStore | null>(null);
  presenceRef.current ??= createPresenceStore();
  const presence = presenceRef.current;

  if (__DEV__ && !env.SOCKET_URL && !warnedAboutMissingUrl) {
    warnedAboutMissingUrl = true;
    console.warn(
      "EXPO_PUBLIC_SOCKET_URL is not set — chat will fall back to polling and everyone will show as offline.",
    );
  }

  const socketRef = useRef<WebSocket | null>(null);
  const connectingRef = useRef(false);
  const attemptRef = useRef(0);
  const heartbeatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** True from logout until the next sign-in, so a close does not reconnect. */
  const stoppedRef = useRef(false);

  /** Usernames each mounted screen wants an online answer about. */
  const trackedRef = useRef(new Map<string, string[]>());
  const signedIn = status === "signed-in";

  /**
   * Friends are always asked about.
   *
   * Held in a ref as well as read from the session so the heartbeat reply can
   * be built inside a socket callback without that callback being rebuilt —
   * and therefore the listener re-attached — every time the session refetches.
   */
  const friendUsernamesRef = useRef<string[]>([]);
  useEffect(() => {
    friendUsernamesRef.current =
      novelist?.friends?.map((friend) => friend.username).filter(Boolean) ?? [];
  }, [novelist]);

  const questionUsernames = useCallback((): string[] => {
    const all = new Set(friendUsernamesRef.current);
    for (const usernames of trackedRef.current.values()) {
      for (const username of usernames) if (username) all.add(username);
    }
    return [...all];
  }, []);

  const rawSend = useCallback((frame: unknown): boolean => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== 1) return false;
    try {
      socket.send(JSON.stringify(frame));
      return true;
    } catch {
      return false;
    }
  }, []);

  // ── Cache writes ─────────────────────────────────────────────────────────

  /**
   * Puts a delivered message into the open conversation's cache.
   *
   * Page 0 is the newest page and each page is newest-first (see
   * `useConversationMessages`), so a new message goes at the *front* of page 0.
   * Getting that backwards puts every incoming message at the bottom of the
   * oldest loaded page, where nobody will see it.
   *
   * The by-id guard is what makes a socket delivery and a poll idempotent: both
   * can carry the same message, and without this the sender sees their own text
   * twice.
   */
  const appendMessage = useCallback(
    (message: Message) => {
      const key = queryKeys.conversationMessages(message.conversationId);
      let inserted = false;

      queryClient.setQueryData<{ pages: Message[][]; pageParams: unknown[] }>(
        key,
        (previous) => {
          // Nothing cached means the conversation has never been opened. Adding
          // a lone message would render a thread of exactly one; leave it, and
          // let the first open fetch the real history.
          if (!previous) return previous;
          if (
            previous.pages.some((page) => page.some((m) => m.id === message.id))
          )
            return previous;

          inserted = true;
          /*
           * The collection fields are filled in if the server left them out.
           *
           * A message broadcast the instant it is created carries no reactions
           * and no attachments, and chat-server sends the object as it is
           * rather than padding it — so those arrive as `undefined` where the
           * REST history has `[]`. Everything downstream then has to guess, and
           * one place did not: reacting to a live-delivered message ran
           * `message.reactions.filter(...)`, threw inside the cache updater,
           * and dropped the reaction silently. Which is why reactions worked on
           * older messages and vanished on the ones just sent.
           */
          const normalised: Message = {
            ...message,
            attachments: message.attachments ?? [],
            reactions: message.reactions ?? [],
          };

          const pages = previous.pages.map((page, index) =>
            index === 0 ? [normalised, ...page] : page,
          );
          return { ...previous, pages };
        },
      );

      // The inbox preview and the unread badge are derived server-side, so they
      // are refetched rather than patched — cheap, and it keeps the "unread"
      // rule in one place instead of reimplemented here.
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations(),
      });

      return inserted;
    },
    [queryClient],
  );

  /**
   * Re-decrypts anything still showing the lock, for one conversation.
   *
   * A message can arrive before its conversation key does — the key fetch has a
   * 30s negative cache, so early history stays locked until something retries
   * it. An incoming message is the natural trigger: the key request that failed
   * is very likely to succeed now.
   */
  const retryUndecrypted = useCallback(
    (conversationId: string) => {
      const key = queryKeys.conversationMessages(conversationId);
      const cached = queryClient.getQueryData<{
        pages: Message[][];
        pageParams: unknown[];
      }>(key);
      if (!cached) return;

      const stuck = cached.pages.flat().filter(crypto.hasUndecryptedContent);
      if (stuck.length === 0) return;

      void crypto.decryptMessages(stuck, conversationId).then((redecrypted) => {
        const byId = new Map(
          redecrypted
            .filter((m) => !crypto.hasUndecryptedContent(m))
            .map((m) => [m.id, m]),
        );
        if (byId.size === 0) return;

        queryClient.setQueryData<{ pages: Message[][]; pageParams: unknown[] }>(
          key,
          (previous) =>
            previous
              ? {
                  ...previous,
                  pages: previous.pages.map((page) =>
                    page.map((m) => byId.get(m.id) ?? m),
                  ),
                }
              : previous,
        );
      });
    },
    [crypto, queryClient],
  );

  const applyEdit = useCallback(
    (edited: Message) => {
      queryClient.setQueryData<{ pages: Message[][]; pageParams: unknown[] }>(
        queryKeys.conversationMessages(edited.conversationId),
        (previous) =>
          previous
            ? {
                ...previous,
                pages: previous.pages.map((page) =>
                  page.map((m) => (m.id === edited.id ? edited : m)),
                ),
              }
            : previous,
      );
    },
    [queryClient],
  );

  const applyReaction = useCallback(
    ({ conversationId, ...reaction }: ReactionPayload) => {
      queryClient.setQueryData<{ pages: Message[][]; pageParams: unknown[] }>(
        queryKeys.conversationMessages(conversationId),
        (previous) => {
          if (!previous) return previous;
          return {
            ...previous,
            pages: previous.pages.map((page) =>
              page.map((message) => {
                if (message.id !== reaction.messageId) return message;
                /*
                 * One reaction per sender per message: replace theirs rather
                 * than appending, or holding the button spawns duplicates.
                 *
                 * Matched on **username**, not on sender id. A reaction sent as
                 * a muse carries that muse's id, so someone switching character
                 * between two reactions would leave both on the message — and
                 * the server, which keys on the account, would disagree with
                 * what is on screen until the next fetch.
                 *
                 * `?? []` because a message delivered over the socket may have
                 * no reactions array at all; see `appendMessage`.
                 */
                const others = (message.reactions ?? []).filter(
                  (existing) =>
                    existing.sender?.username !== reaction.sender?.username,
                );
                return { ...message, reactions: [...others, reaction] };
              }),
            ),
          };
        },
      );
    },
    [queryClient],
  );

  // ── Frame handling ───────────────────────────────────────────────────────

  const handleFrame = useCallback(
    (raw: string) => {
      const frame = parseSocketFrame(raw);
      if (!frame) return;

      if (isServerPing(frame)) {
        presence.replace(frame.payload.usernames);

        // Restart the watchdog. A socket the OS has silently dropped stops
        // delivering pings but never fires `close`, so without this the app
        // shows "connected" over a dead pipe.
        if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
        heartbeatTimerRef.current = setTimeout(() => {
          socketRef.current?.close();
        }, HEARTBEAT_TIMEOUT_MS);

        rawSend(createHeartbeatPong(questionUsernames(), isAppActive()));
        return;
      }

      if (isServerNotification(frame)) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.notifications(),
        });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.notificationCounts(),
        });
        return;
      }

      if (isServerMessage(frame)) {
        void crypto.decryptMessage(frame).then((message) => {
          appendMessage(message);
          retryUndecrypted(message.conversationId);
        });
        return;
      }

      if (isServerEdit(frame)) {
        void crypto
          .decryptMessage(frame.payload)
          .then((message) => applyEdit(message));
        return;
      }

      if (isServerReaction(frame)) {
        applyReaction(frame.payload);
      }
    },
    [
      appendMessage,
      applyEdit,
      applyReaction,
      crypto,
      questionUsernames,
      rawSend,
      retryUndecrypted,
    ],
  );

  // ── Connect ──────────────────────────────────────────────────────────────

  const scheduleReconnect = useCallback(() => {
    if (stoppedRef.current || !env.SOCKET_URL) return;
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);

    const delay =
      BACKOFF_MS[Math.min(attemptRef.current, BACKOFF_MS.length - 1)];
    attemptRef.current += 1;
    reconnectTimerRef.current = setTimeout(() => {
      void connectRef.current?.();
    }, delay);
  }, []);

  /**
   * Opens the socket with a single-use ticket rather than the session token.
   *
   * A WebSocket upgrade cannot carry a header, so whatever authenticates it
   * travels in the URL — and a URL ends up in nginx logs, in every proxy in
   * between, and in chat-server's own stdout. That used to be the session JWT,
   * good for a day (SECURITY_AUTH_PLAN H1). A ticket is minted per attempt,
   * expires in about thirty seconds and burns on redemption, so the same log
   * line is worthless by the time anyone reads it.
   */
  const connect = useCallback(async () => {
    if (
      socketRef.current ||
      connectingRef.current ||
      stoppedRef.current ||
      !signedIn ||
      !env.SOCKET_URL
    )
      return;

    connectingRef.current = true;
    try {
      const ticket = await getWebSocketTicket(api);
      // No ticket means no live session. Staying disconnected is correct — the
      // session query is about to reach the same conclusion.
      if (!ticket) {
        scheduleReconnect();
        return;
      }
      // The session can end during the round trip.
      if (socketRef.current || stoppedRef.current) return;

      const socket = new WebSocket(
        `${toWebSocketUrl(env.SOCKET_URL)}?ticket=${encodeURIComponent(ticket)}`,
      );
      socketRef.current = socket;

      socket.onopen = () => {
        attemptRef.current = 0;
        setIsConnected(true);
        // Ask immediately: otherwise every avatar is grey until the server's
        // first ping, up to thirty seconds after the socket opens.
        rawSend(createHeartbeatQuery(questionUsernames(), isAppActive()));
      };

      socket.onmessage = (event: { data: unknown }) => {
        if (typeof event.data === "string") handleFrame(event.data);
      };

      socket.onerror = () => {
        // `close` always follows, and that is where reconnection is decided.
        // Logging the event object itself is noise: on RN it carries no detail.
      };

      socket.onclose = () => {
        if (heartbeatTimerRef.current) {
          clearTimeout(heartbeatTimerRef.current);
          heartbeatTimerRef.current = null;
        }
        socketRef.current = null;
        setIsConnected(false);
        presence.replace([]);
        scheduleReconnect();
      };
    } catch {
      scheduleReconnect();
    } finally {
      connectingRef.current = false;
    }
  }, [
    api,
    handleFrame,
    questionUsernames,
    rawSend,
    scheduleReconnect,
    signedIn,
  ]);

  /**
   * `scheduleReconnect` needs `connect`, and `connect` needs
   * `scheduleReconnect`. A ref breaks the cycle without either callback taking
   * the other as a dependency and being rebuilt on every render.
   */
  const connectRef = useRef<typeof connect | null>(null);
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const ensureConnected = useCallback(() => {
    if (!signedIn || !env.SOCKET_URL) return;
    if (socketRef.current || connectingRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void connectRef.current?.();
    }, CONNECT_DEBOUNCE_MS);
  }, [signedIn]);

  // ── Session lifecycle ────────────────────────────────────────────────────

  useEffect(() => {
    if (signedIn) {
      stoppedRef.current = false;
      attemptRef.current = 0;
      ensureConnected();
      return;
    }

    // Signed out (or still loading): tear down and stay down. Reconnecting a
    // socket after logout is how a revoked session keeps receiving messages.
    if (status === "signed-out" || status === "onboarding") {
      stoppedRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      socketRef.current?.close();
      socketRef.current = null;
      setIsConnected(false);
      presence.replace([]);
    }
  }, [signedIn, status, ensureConnected]);

  // ── Foreground transitions ───────────────────────────────────────────────

  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      if (next !== "active") {
        // Say so while the socket is still up. The server pushes to this
        // phone only once the app is in front of the person nowhere, and the
        // socket outlives the app going to the background by up to a minute.
        rawSend(createHeartbeatQuery(questionUsernames(), false));
        return;
      }
      // Android drops sockets during doze without a close frame, so the app can
      // come back believing it is connected. Reconnect if the socket is gone,
      // and re-ask for presence if it survived — the answer is up to thirty
      // seconds stale and the user is looking at it right now.
      if (!socketRef.current) {
        attemptRef.current = 0;
        ensureConnected();
      } else {
        rawSend(createHeartbeatQuery(questionUsernames(), true));
      }
      void queryClient.invalidateQueries({
        queryKey: queryKeys.unreadConversations(),
      });
    };

    const subscription = AppState.addEventListener("change", onChange);
    return () => subscription.remove();
  }, [ensureConnected, questionUsernames, queryClient, rawSend]);

  // ── Teardown ─────────────────────────────────────────────────────────────

  useEffect(
    () => () => {
      stoppedRef.current = true;
      if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      socketRef.current?.close();
      socketRef.current = null;
    },
    [],
  );

  // ── Presence registration ────────────────────────────────────────────────

  const trackUsernames = useCallback(
    (key: string, usernames: string[]) => {
      trackedRef.current.set(key, usernames);
      rawSend(createHeartbeatQuery(questionUsernames()));

      return () => {
        trackedRef.current.delete(key);
        // No re-query on unregister: the answer only shrinks, and a frame per
        // unmounting screen is chatter for a list nobody is looking at.
      };
    },
    [questionUsernames, rawSend],
  );

  /**
   * Who you are, into the presence store.
   *
   * This is what `useIsOnline` used to answer by calling `useSession()` — which
   * meant two `QueryObserver`s created and torn down *per avatar*, sixty-odd of
   * them on a friends screen, to look up one string that changes at sign-in and
   * never again. Written once here instead.
   */
  useEffect(() => {
    presence.setSelf(novelist?.username ?? null, isConnected);
  }, [isConnected, novelist?.username, presence]);

  const value = useMemo<ChatSocketValue>(
    () => ({
      ensureConnected,
      isConnected,
      sendMessage: (payload) => {
        const sent = rawSend(createMessageSocketMessage(payload));
        // Someone who has just written will want to hear the answer: the one
        // moment the phone's permission prompt is worth showing.
        if (sent) void registerForPush(true);
        return sent;
      },
      sendReaction: (payload) => rawSend(createReactionSocketMessage(payload)),
      trackUsernames,
    }),
    [ensureConnected, isConnected, rawSend, trackUsernames],
  );

  return (
    <PresenceContext.Provider value={presence}>
      <ChatSocketContext.Provider value={value}>
        {children}
      </ChatSocketContext.Provider>
    </PresenceContext.Provider>
  );
};

// ─── Presence hooks ──────────────────────────────────────────────────────────

/** A subscription that never fires, for an avatar with no username. */
const NEVER = () => () => {};
const OFFLINE = () => false;

/**
 * Is this person connected right now?
 *
 * Subscribed to *that name* rather than to the whole presence answer, so a
 * heartbeat about forty other people does not re-render this avatar. That is
 * the difference between a list that holds still between pings and one that
 * repaints every face twice a minute.
 *
 * Yourself is handled inside the store: the server does not report you back in
 * your own heartbeat answer, so an open socket is the proof.
 */
export const useIsOnline = (username: string | undefined | null): boolean => {
  const presence = useContext(PresenceContext);

  const subscribe = useCallback(
    (onChange: () => void) =>
      username ? presence.subscribe(username, onChange) : NEVER(),
    [presence, username],
  );

  const getSnapshot = useCallback(
    () => (username ? presence.isOnline(username) : false),
    [presence, username],
  );

  return useSyncExternalStore(subscribe, getSnapshot, OFFLINE);
};

let trackerId = 0;

/**
 * Asks the server about these usernames for as long as the caller is mounted.
 *
 * Call it once per screen with everyone visible on it. The server only answers
 * about the usernames it was last asked, so an unregistered avatar is not
 * "unknown" — it is reported offline, indistinguishably from someone who really
 * is.
 */
export const useTrackOnline = (usernames: (string | undefined | null)[]) => {
  const { trackUsernames } = useChatSocket();
  const keyRef = useRef<string>("");
  if (!keyRef.current) {
    trackerId += 1;
    keyRef.current = `tracker-${trackerId}`;
  }

  // Sorted and joined so a re-render that produces an equal-but-new array does
  // not re-register — which would send a heartbeat query per render.
  const fingerprint = usernames
    .filter((name): name is string => Boolean(name))
    .sort()
    .join(",");

  useEffect(() => {
    if (!fingerprint) return;
    return trackUsernames(keyRef.current, fingerprint.split(","));
  }, [fingerprint, trackUsernames]);
};
