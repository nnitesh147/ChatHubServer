import { config } from "dotenv";
import express from "express";
import cors from "cors";
import authRouter from "./routes/AuthRoutes.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/MessageRoutes.js";
import { Server } from "socket.io";
import userWebhookRouter from "./routes/webhookRoutes.js";

const app = express();
config({
  path: ".env",
});
app.use(cors());

app.use("/uploads/images", express.static("uploads/images"));

app.get("/", (req, res) => {
  res.json("Server is running and healthy");
});

app.use("/api/auth", express.json(), authRouter);
app.use("/api/user", express.json(), userRouter);
app.use("/api/message", express.json(), messageRouter);
app.use("/api/webhooks", userWebhookRouter);

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on ${process.env.PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.broadcast.emit("online-users", {
      onlineUsers: Array.from(onlineUsers.keys()),
    });
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieved", {
        from: data.from,
        message: data.message,
      });
    }
  });

  socket.on("outgoing-voice-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("incoming-voice-call", {
        from: data.from,
        roomId: data.roomId,
        callType: data.callType,
      });
    }
  });

  socket.on("outgoing-video-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("incoming-video-call", {
        from: data.from,
        roomId: data.roomId,
        callType: data.callType,
      });
    }
  });

  socket.on("reject-voice-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.from);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("voice-call-rejected");
    }
  });

  socket.on("reject-video-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.from);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("video-call-rejected");
    }
  });

  socket.on("accept-incoming-call", ({ id }) => {
    const sendUserSocket = onlineUsers.get(id);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("accept-call");
    }
  });

  socket.on("logout", (data) => {
    onlineUsers.delete(data);
    socket.broadcast.emit("online-users", {
      onlineUsers: Array.from(onlineUsers.keys()),
    });
  });
});
