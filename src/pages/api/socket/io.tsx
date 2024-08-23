// pages/api/socket/io.tsx
import { Server as NetServer } from "http";
import { NextApiRequest, NextApiResponse } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponseServerIO } from "../../../types/socket";
import { ConnectionsService } from "../../../utils/services/connections-service";
import { authenticateJWT } from "@/app/actions";
import { sendMessageAPI } from "@/app/rp/novelists/actions";
import { API_MESSAGE } from "@/utils/constants";
import { Message } from "@/types/conversation";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: path,
      addTrailingSlash: false,
      cors: {
        origin: ["http://localhost:4200", "http://www.chat.novelist.world"],
        methods: ["GET", "POST"],
        credentials: true,
      },
    });
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      ConnectionsService.addConnection(socket);

      socket.on("set-metadata", (username) => {
        ConnectionsService.setMetadata(socket, username);
      });

      socket.on("message", async (message) => {
        console.log("message", message);
        const connections = ConnectionsService.getConnections();

        const sender = connections.find((c) => c.id === socket.id);
        if (!sender) {
          return;
        }
        console.log("socket id", socket.id);
        console.log("sender", sender.id);
        const verified = authenticateJWT()(sender.data.jwt);

        if (!verified) {
          socket.emit("error", { message: "Unauthorized" });
          socket.disconnect();
        }

        const messageObject: Message = {
          sender: sender.data.username,
          receiver: message.receiver,
          message: message.message,
          date: new Date().toISOString(),
          _tag: "Message",
          id: "",
        };

        const serverResponse = await sendMessageAPI(sender.data.jwt)(
          messageObject
        );
        if (serverResponse?.message === API_MESSAGE.Error) {
          socket.emit("error", { message: "Internal Error" });
        } else {
          socket.emit("message", serverResponse);
          const receivers = connections.filter(
            (c) => c.data.username === message.receiver
          );
          receivers.forEach((receiver) =>
            receiver.emit("message", serverResponse)
          );
        }
      });
      socket.on("disconnect", () => {
        ConnectionsService.removeConnection(socket);
      });
    });
  }

  res.end();
};

export default ioHandler;
