import { Router } from "express";
import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import { authMiddleware } from "../middlewares/AuthMiddleware.js";
import { getAllUsers } from "../controllers/userController.js";

const userRouter = Router();

userRouter.get(
  "/getContacts",
  ClerkExpressWithAuth({}),
  authMiddleware,
  getAllUsers
);

export default userRouter;
