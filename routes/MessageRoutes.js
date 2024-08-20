import { Router } from "express";
import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import { authMiddleware } from "../middlewares/AuthMiddleware.js";
import {
  addImageMessage,
  addMessage,
  getInitialContactswithMessages,
  getMessage,
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

export default messageRouter;
