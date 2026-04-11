"use client";

import {
  createContext,
  type FC,
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
};

// ─── Context & hook ──────────────────────────────────────────────────────────

const SocketContext = createContext<SocketContextType>({
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

// ─── Provider ────────────────────────────────────────────────────────────────

type SocketProviderProps = {
  children: React.ReactNode;
};

export const SocketProvider: FC<SocketProviderProps> = ({ children }) => {
  const authState = useGlobalState("authState");
  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");
  const [cookies] = useCookies([JWT_COOKIE_NAME]);
  const jwt: string | undefined = cookies[JWT_COOKIE_NAME];
  const [socket, setSocket] = useState<WebSocketExt | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsernames, setOnlineUsernames] = useState<string[]>([]);
  const [lastIncomingMessage, setLastIncomingMessage] =
    useState<Message | null>(null);
  // Keep a stable ref so cleanup inside the effect always sees current socket
  const socketRef = useRef<WebSocketExt | null>(null);

  useEffect(() => {
    const cleanup = () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
        setSocket(null);
      }
    };

    // Only connect when logged in, JWT is present, URL is configured,
    // and no connection is already alive.
    if (authState !== "LOGGED_IN" || !jwt || !SOCKET_URL || socketRef.current) {
      return;
    }

    const connect = () => {
      const params = new URLSearchParams();
      params.append("token", jwt);
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
        if (socketInstance.pingTimeout)
          clearTimeout(socketInstance.pingTimeout);
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      });

      socketRef.current = socketInstance;
      setSocket(socketInstance);
    };

    const timeout = setTimeout(connect, CONNECT_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeout);
      cleanup();
    };
  }, [authState, jwt]);

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
      value={{ isConnected, lastIncomingMessage, onlineUsernames, socket }}
    >
      {children}
    </SocketContext.Provider>
  );
};
