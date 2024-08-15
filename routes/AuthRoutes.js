import { Router } from "express";
import { checkUser, onBoardUser } from "../controllers/AuthController.js";
import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import { authMiddleware } from "../middlewares/AuthMiddleware.js";

const authRouter = Router();

authRouter.post(
  "/check-user",
  ClerkExpressWithAuth({}),
  authMiddleware,
  checkUser
);
authRouter.post(
  "/on-board",
  ClerkExpressWithAuth({}),
  authMiddleware,
  onBoardUser
);

export default authRouter;
