import type { Server as NetServer, Socket } from "node:net";
import type { NextApiResponse } from "next";
import type { Server as ServerIO } from "socket.io";

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

export interface WebSocketExt extends WebSocket {
  // ReturnType<typeof setTimeout> resolves to `number` in the browser and
  // `NodeJS.Timeout` in Node — using ReturnType keeps both environments happy.
  pingTimeout?: ReturnType<typeof setTimeout>;
}
