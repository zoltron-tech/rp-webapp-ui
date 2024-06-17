// pages/api/socket/io.tsx
import { Server as NetServer } from "http";
import { NextApiRequest, NextApiResponse } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponseServerIO } from "../../../types/socket";
import { cors, runMiddleware } from "../middleware/cors";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  // Run the middleware
  await runMiddleware(req, res, cors);

  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: path,
      addTrailingSlash: false,
      cors: {
        origin: "http://localhost:4200", // Allow only this origin
        methods: ["GET", "POST"],
        credentials: true,
      },
    });
    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
