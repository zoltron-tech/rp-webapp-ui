"use client";

import {
  createContext,
  type FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useCookies } from "react-cookie";
import { useGlobalState } from "@/context/store/stores";
import type { Message } from "@/types";
import type { WebSocketExt } from "@/types/socket";
import { JWT_COOKIE_NAME, SOCKET_URL } from "@/utils/constants";
import {
  createHeartbeatPong,
  HEARTBEAT_TIMEOUT_MS,
  isServerMessage,
  isServerPing,
} from "@/utils/socket-helpers";

// ─── Types ───────────────────────────────────────────────────────────────────

type SocketContextType = {
  socket: WebSocketExt | null;
  isConnected: boolean;
  onlineUsernames: string[];
  lastIncomingMessage: Message | null;
  /** Call before any user action to guarantee the socket is open (no-op if already connected or not logged in). */
  ensureConnected: () => void;
};

// ─── Context & hook ──────────────────────────────────────────────────────────

const SocketContext = createContext<SocketContextType>({
  ensureConnected: () => {},
  isConnected: false,
  lastIncomingMessage: null,
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
  const [cookies] = useCookies([JWT_COOKIE_NAME]);
  const jwt: string | undefined = cookies[JWT_COOKIE_NAME];
  const [socket, setSocket] = useState<WebSocketExt | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsernames, setOnlineUsernames] = useState<string[]>([]);
  const [lastIncomingMessage, setLastIncomingMessage] =
    useState<Message | null>(null);

  // Keep stable refs so callbacks never capture stale values
  const socketRef = useRef<WebSocketExt | null>(null);
  const authStateRef = useRef(authState);
  const jwtRef = useRef(jwt);
  const connectDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityCheckRef = useRef<number>(0);

  useEffect(() => {
    authStateRef.current = authState;
  }, [authState]);
  useEffect(() => {
    jwtRef.current = jwt;
  }, [jwt]);

  // ─── Core connect logic ──────────────────────────────────────────────────

  const connectSocket = useCallback(() => {
    // Guard: skip if already open/connecting or prerequisites missing
    if (socketRef.current || !jwtRef.current || !SOCKET_URL) return;

    const params = new URLSearchParams();
    params.append("token", jwtRef.current);
    const webSocketUrl = `${SOCKET_URL}?${params.toString()}`;

    const socketInstance = new WebSocket(webSocketUrl) as WebSocketExt;

    socketInstance.addEventListener("open", () => {
      console.log("websocket:open");
      setIsConnected(true);
    });

    socketInstance.addEventListener("error", (error) => {
      console.log("websocket:error", error);
    });

    socketInstance.addEventListener("close", (event) => {
      console.log("websocket:close", event);
      if (socketInstance.pingTimeout) clearTimeout(socketInstance.pingTimeout);
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);
  }, []);

  // ─── Debounced ensureConnected ───────────────────────────────────────────
  // Schedules a connection attempt (if not already open) after a short debounce.

  const ensureConnected = useCallback(() => {
    if (authStateRef.current !== "LOGGED_IN" || !jwtRef.current || !SOCKET_URL)
      return;
    if (socketRef.current) return; // already open or connecting

    if (connectDebounceRef.current) clearTimeout(connectDebounceRef.current);
    connectDebounceRef.current = setTimeout(connectSocket, CONNECT_DEBOUNCE_MS);
  }, [connectSocket]);

  // ─── Auth-change effect ──────────────────────────────────────────────────
  // Connects on login; closes the socket on logout.

  useEffect(() => {
    if (authState === "LOGGED_IN" && jwt && SOCKET_URL) {
      const timeout = setTimeout(connectSocket, CONNECT_DEBOUNCE_MS);
      return () => clearTimeout(timeout);
    }

    // Tear down the socket whenever the user is no longer logged in
    if (authState === "LOGGED_OUT" && socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setSocket(null);
    }
  }, [authState, jwt, connectSocket]);

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
        setLastIncomingMessage(data);
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
      socket.send(JSON.stringify(createHeartbeatPong(usernames)));
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
        lastIncomingMessage,
        onlineUsernames,
        socket,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
