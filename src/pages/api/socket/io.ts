import { NextApiResponseServerIo } from "@/lib/types";
import { Server as NetServer } from "http";
import { NextApiRequest, NextApiResponse } from "next";
import { Server as ServerIo } from "socket.io";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIo(httpServer, {
      addTrailingSlash: false,
      path,
    });
    io.on("connection", (s) => {
      // Creating Room
      s.on("createRoom", (fileId) => {
        s.join(fileId);
      });

      // Sending changes to particular file
      s.on("sendChanges", (deltas, fileId) => {
        s.to(fileId).emit("reciveChanges", deltas, fileId);
      });

      // Sending mouse move to particular file
      s.on("sendCursorMove", (range, fileId, cursorId) => {
        s.to(fileId).emit("reciveCursorMove", range, fileId, cursorId);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default ioHandler;
