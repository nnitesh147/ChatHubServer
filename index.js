import { config } from "dotenv";
import express from "express";
import cors from "cors";
import authRouter from "./routes/AuthRoutes.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/MessageRoutes.js";

const app = express();
config({
  path: ".env",
});
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json("Server is running and healthy");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/message", messageRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on ${process.env.PORT}`);
});

global.onlineUsers = new Map();
