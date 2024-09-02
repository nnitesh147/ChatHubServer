import { Router } from "express";
import { user_activity } from "../controllers/webhooksController.js";
import bodyParser from "body-parser";

const userWebhookRouter = Router();

userWebhookRouter.post(
  "/user_activity",
  bodyParser.raw({ type: "application/json" }),
  user_activity
);

export default userWebhookRouter;
