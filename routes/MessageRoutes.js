import { Router } from "express";
import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import { authMiddleware } from "../middlewares/AuthMiddleware.js";
import {
  addImageMessage,
  addMessage,
  getAllGeminiMessage,
  getInitialContactswithMessages,
  getMessage,
  sendMessageToGemini,
} from "../controllers/MessageController.js";
import multer from "multer";

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

const uploadImage = multer({ dest: "/tmp" });

messageRouter.post(
  "/add-image-message",
  ClerkExpressWithAuth({}),
  authMiddleware,
  uploadImage.single("file"),
  addImageMessage
);

messageRouter.get(
  "/get-all-initial-contacts/:userId/",
  ClerkExpressWithAuth({}),
  authMiddleware,
  getInitialContactswithMessages
);

messageRouter.post(
  "/sendGeminiMessage",
  ClerkExpressWithAuth({}),
  authMiddleware,
  sendMessageToGemini
);

messageRouter.get(
  "/getAllGeminiMessage/:userId",
  ClerkExpressWithAuth({}),
  authMiddleware,
  getAllGeminiMessage
);

export default messageRouter;
