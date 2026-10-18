"use client";

import type { Message } from "@nw/types";
import {
  createContext,
  type FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getSocketTicketAction } from "@/app/actions";
import { getUnreadConversationIdsAction } from "@/app/rp/conversations/actions";
import { getNotifications } from "@/app/rp/novelists/actions";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import type { WebSocketExt } from "@/types/socket";
import { SOCKET_URL } from "@/utils/constants";
import { decryptMessage } from "@/utils/e2e-crypto";
import {
  type ActionErrorSocketPayload,
  createHeartbeatPong,
  createHeartbeatQuery,
  type DeleteSocketPayload,
  HEARTBEAT_TIMEOUT_MS,
  isServerActionError,
  isServerDelete,
  isServerEdit,
  isServerMessage,
  isServerNotification,
  isServerPing,
  isServerReaction,
  type ReactionSocketPayload,
} from "@/utils/socket-helpers";

// ─── Types ───────────────────────────────────────────────────────────────────

type SocketContextType = {
  socket: WebSocketExt | null;
  isConnected: boolean;
  onlineUsernames: string[];
  lastIncomingMessage: Message | null;
  lastIncomingReaction: ReactionSocketPayload | null;
  lastIncomingEdit: Message | null;
  /** A message someone took back: ids only, the words are already gone. */
  lastIncomingDelete: DeleteSocketPayload | null;
  /** The backend refused an edit or delete this tab sent over the socket. */
  lastIncomingActionError: ActionErrorSocketPayload | null;
  /** Call before any user action to guarantee the socket is open (no-op if already connected or not logged in). */
  ensureConnected: () => void;
};

// ─── Context & hook ──────────────────────────────────────────────────────────

const SocketContext = createContext<SocketContextType>({
  ensureConnected: () => {},
  isConnected: false,
  lastIncomingActionError: null,
  lastIncomingDelete: null,
  lastIncomingEdit: null,
  lastIncomingMessage: null,
  lastIncomingReaction: null,
  onlineUsernames: [],
  socket: null,
});

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const CONNECT_DEBOUNCE_MS = 500;

/** User-interaction events that trigger a reconnect check. */
const ACTIVITY_EVENTS = [
  "click",
  "keydown",
  "scroll",
  "touchstart",
  "mousemove",
] as const;

/** Minimum ms between activity-triggered reconnect attempts. */
const ACTIVITY_THROTTLE_MS = 2_000;

// ─── Provider ────────────────────────────────────────────────────────────────

type SocketProviderProps = {
  children: React.ReactNode;
};

export const SocketProvider: FC<SocketProviderProps> = ({ children }) => {
  const authState = useGlobalState("authState");
  const novelist = useGlobalState("novelist");
  /** The usernames the heartbeat asks about, for handlers that outlive a render. */
  const friendUsernamesRef = useRef<string[]>([]);
  friendUsernamesRef.current = novelist?.friends?.map((f) => f.username) ?? [];
  const setGlobalState = useGlobalStoreSet();
  const [socket, setSocket] = useState<WebSocketExt | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsernames, setOnlineUsernames] = useState<string[]>([]);
  const [lastIncomingMessage, setLastIncomingMessage] =
    useState<Message | null>(null);
  const [lastIncomingReaction, setLastIncomingReaction] =
    useState<ReactionSocketPayload | null>(null);
  const [lastIncomingEdit, setLastIncomingEdit] = useState<Message | null>(
    null,
  );
  const [lastIncomingDelete, setLastIncomingDelete] =
    useState<DeleteSocketPayload | null>(null);
  const [lastIncomingActionError, setLastIncomingActionError] =
    useState<ActionErrorSocketPayload | null>(null);

  // Keep stable refs so callbacks never capture stale values
  const socketRef = useRef<WebSocketExt | null>(null);
  const authStateRef = useRef(authState);
  const connectDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /**
   * Guards the gap between asking for a ticket and the socket existing.
   *
   * `socketRef` is only set once `new WebSocket` returns, so without this a
   * second connect attempt during the ticket round trip would mint a second
   * ticket and open a second socket.
   */
  const connectingRef = useRef(false);
  const lastActivityCheckRef = useRef<number>(0);
  const reconnectingRef = useRef(false);

  // ─── Core connect logic ──────────────────────────────────────────────────
  /**
   * Opens the socket with a single-use ticket rather than the session token.
   *
   * A `WebSocket` handshake cannot carry a header, so whatever authenticates it
   * has to sit in the URL — and it used to be the session JWT, which then lived
   * on in nginx access logs, in every intermediary proxy log, and in
   * chat-server's own stdout, valid for a day (SECURITY_AUTH_PLAN H1). A ticket
   * is fetched per attempt, dies thirty seconds later, and burns on first
   * redemption, so the same log line is worthless by the time anyone reads it.
   *
   * Now asynchronous, which is the one behavioural change: a fresh ticket is one
   * request away, and callers that fire this optimistically (the activity
   * listeners, the debounce) must not stack up attempts — hence `connectingRef`.
   */
  const connectSocket = useCallback(async () => {
    if (
      socketRef.current ||
      connectingRef.current ||
      authStateRef.current !== "LOGGED_IN" ||
      !SOCKET_URL
    )
      return;

    connectingRef.current = true;
    try {
      const ticket = await getSocketTicketAction();
      // No ticket means no live session. Staying disconnected is right: the auth
      // provider is about to notice the same thing.
      if (!ticket) return;

      // Auth state can change during the round trip — a logout, say.
      if (socketRef.current || authStateRef.current !== "LOGGED_IN") return;

      const params = new URLSearchParams();
      params.append("ticket", ticket);
      const webSocketUrl = `${SOCKET_URL}?${params.toString()}`;
      const socketInstance = new WebSocket(webSocketUrl) as WebSocketExt;
      socketInstance.addEventListener("open", () => {
        setIsConnected(true);
      });
      socketInstance.addEventListener("error", (error) => {
        console.log("websocket:error", error);
      });
      socketInstance.addEventListener("close", () => {
        if (socketInstance.pingTimeout) clearTimeout(socketInstance.pingTimeout);
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      });
      socketRef.current = socketInstance;
      setSocket(socketInstance);
    } catch (error) {
      console.log("websocket:ticket-failed", error);
    } finally {
      connectingRef.current = false;
    }
  }, []);

  // ─── Debounced ensureConnected ───────────────────────────────────────────
  const ensureConnected = useCallback(() => {
    if (authStateRef.current !== "LOGGED_IN" || !SOCKET_URL) return;
    if (socketRef.current || connectingRef.current) return;
    if (connectDebounceRef.current) clearTimeout(connectDebounceRef.current);
    connectDebounceRef.current = setTimeout(() => {
      void connectSocket();
    }, CONNECT_DEBOUNCE_MS);
  }, [connectSocket]);

  // Now place the visibilitychange effect after ensureConnected is defined
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Tell the server at once, in both directions. It pushes to a device
      // only when the app is in front of the person nowhere, and a hidden tab
      // that still counted as present would keep their phone silent.
      if (socketRef.current?.readyState === 1) {
        socketRef.current.send(
          JSON.stringify(
            createHeartbeatQuery(
              friendUsernamesRef.current,
              document.visibilityState === "visible",
            ),
          ),
        );
      }
      if (document.visibilityState === "visible") {
        if (!socketRef.current && authStateRef.current === "LOGGED_IN") {
          ensureConnected();
        }
        if (
          socketRef.current &&
          socketRef.current.readyState === 1 &&
          !reconnectingRef.current
        ) {
          reconnectingRef.current = true;
          getUnreadConversationIdsAction().then((result) => {
            if (Array.isArray(result)) {
              setGlobalState({ unreadConversationIds: result });
            }
            setTimeout(() => {
              reconnectingRef.current = false;
            }, 1000);
          });
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [setGlobalState, ensureConnected]);
  // ...rest of the component (existing code follows here)

  useEffect(() => {
    authStateRef.current = authState;
  }, [authState]);

  // ─── Auth-change effect ──────────────────────────────────────────────────
  // Connects on login; closes the socket on logout.

  useEffect(() => {
    if (authState === "LOGGED_IN" && SOCKET_URL) {
      const timeout = setTimeout(() => {
        void connectSocket();
      }, CONNECT_DEBOUNCE_MS);
      return () => clearTimeout(timeout);
    }

    // Tear down the socket whenever the user is no longer logged in
    if (authState === "LOGGED_OUT") {
      // Cancel any pending reconnect attempt before tearing down
      if (connectDebounceRef.current) {
        clearTimeout(connectDebounceRef.current);
        connectDebounceRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
        setSocket(null);
      }
    }
  }, [authState, connectSocket]);

  // ─── User-activity listeners ─────────────────────────────────────────────
  // Any user interaction re-checks the connection so it is re-established
  // automatically after a drop, without the user having to refresh.

  useEffect(() => {
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivityCheckRef.current < ACTIVITY_THROTTLE_MS) return;
      lastActivityCheckRef.current = now;
      ensureConnected();
    };

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, handleActivity, { passive: true });
    }

    return () => {
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, handleActivity);
      }
    };
  }, [ensureConnected]);

  // ─── Heartbeat handler ───────────────────────────────────────────────────
  // Listens for server pings and responds with a pong to keep the connection
  // alive. A client-side timeout closes the socket if pings stop arriving.
  useEffect(() => {
    if (!socket || !isConnected) return;

    const onMessage = (event: MessageEvent) => {
      let data: unknown;
      try {
        data = JSON.parse(event.data as string);
      } catch {
        return;
      }

      if (isServerMessage(data)) {
        // Messages arrive encrypted; decrypt once here so every consumer of
        // lastIncomingMessage sees plaintext.
        decryptMessage(data).then(setLastIncomingMessage);
        return;
      }

      if (isServerReaction(data)) {
        setLastIncomingReaction(data.payload);
        return;
      }

      if (isServerEdit(data)) {
        decryptMessage(data.payload).then(setLastIncomingEdit);
        return;
      }

      if (isServerDelete(data)) {
        setLastIncomingDelete(data.payload);
        return;
      }

      if (isServerActionError(data)) {
        setLastIncomingActionError(data.payload);
        return;
      }

      if (isServerNotification(data)) {
        // The bell reads the store, which is otherwise loaded once per
        // session; refetch so a notification shows up while the app is open.
        void getNotifications(1, 30).then((notifications) => {
          if (Array.isArray(notifications)) setGlobalState({ notifications });
        });
        return;
      }

      if (!isServerPing(data)) return;

      // Track which users the server reports as online
      setOnlineUsernames(data.payload.usernames);

      // Reset the client-side watchdog timer
      if (socketRef.current?.pingTimeout) {
        clearTimeout(socketRef.current.pingTimeout);
      }
      if (socketRef.current) {
        socketRef.current.pingTimeout = setTimeout(() => {
          console.log("websocket:heartbeat timeout — closing");
          socketRef.current?.close();
        }, HEARTBEAT_TIMEOUT_MS);
      }

      // Reply so the server resets its own heartbeat flag and records this user
      const usernames = novelist?.friends?.map((f) => f.username) ?? [];
      socket.send(
        JSON.stringify(
          createHeartbeatPong(
            usernames,
            document.visibilityState === "visible",
          ),
        ),
      );
    };

    socket.addEventListener("message", onMessage);

    return () => {
      socket.removeEventListener("message", onMessage);
      if (socketRef.current?.pingTimeout) {
        clearTimeout(socketRef.current.pingTimeout);
      }
    };
  }, [socket, isConnected, novelist]);

  // Ensure the socket is closed when the component unmounts
  useEffect(() => {
    return () => {
      if (connectDebounceRef.current) {
        clearTimeout(connectDebounceRef.current);
        connectDebounceRef.current = null;
      }
      if (socketRef.current) {
        if (socketRef.current.pingTimeout) {
          clearTimeout(socketRef.current.pingTimeout);
        }
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        ensureConnected,
        isConnected,
        lastIncomingActionError,
        lastIncomingDelete,
        lastIncomingEdit,
        lastIncomingMessage,
        lastIncomingReaction,
        onlineUsernames,
        socket,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
