"use client";

import { FC, createContext, useContext, useEffect, useState } from "react";
import { io as ClientIO } from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:3000";

type SocketContext = {
  socket: typeof ClientIO;
  connected: boolean;
};

export const SocketContext = createContext<SocketContext>({
  socket: ClientIO,
  connected: false,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }

  return context;
};

type SocketProviderProps = {
  children: React.ReactNode;
};

export const SocketProvider: FC<SocketProviderProps> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<typeof ClientIO | null>(null);

  useEffect(() => {
    const socketInstance = new (ClientIO as any)(SOCKET_SERVER_URL, {
      path: "/api/socket/io",
      addTrailingSlash: false,
    });

    socketInstance.on("connect", () => {
      setConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setConnected(false);
    });

    socketInstance.on("message", (data: any) => {});

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{ socket: socket as typeof ClientIO, connected }}
    >
      {children}
    </SocketContext.Provider>
  );
};
