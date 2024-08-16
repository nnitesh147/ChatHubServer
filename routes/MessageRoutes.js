import { Router } from "express";
("express");
import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import { authMiddleware } from "../middlewares/AuthMiddleware.js";
import { addMessage, getMessage } from "../controllers/MessageController.js";

const messageRouter = Router();

messageRouter.post(
  "/add-message",
  ClerkExpressWithAuth({}),
  authMiddleware,
  addMessage
);

messageRouter.get(
  "/getAllMessage/:from/:to",
  ClerkExpressWithAuth({}),
  authMiddleware,
  getMessage
);

export default messageRouter;
