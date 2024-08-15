import { config } from "dotenv";
import express from "express";
import cors from "cors";
import authRouter from "./routes/AuthRoutes.js";

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

app.listen(process.env.PORT, () => {
  console.log(`Server is running on ${process.env.PORT}`);
});
