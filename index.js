import { config } from "dotenv";
import express from "express";
import cors from "cors";
import authRouter from "./routes/AuthRoutes.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/MessageRoutes.js";
import { Server } from "socket.io";

const app = express();
config({
  path: ".env",
});
app.use(cors());
app.use(express.json());

app.use("/uploads/images", express.static("uploads/images"));

app.get("/", (req, res) => {
  res.json("Server is running and healthy");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/message", messageRouter);

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
});
