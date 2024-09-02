import { Webhook } from "svix";
import { config } from "dotenv";
import { db } from "../db/index.js";
import { users } from "../db/schema/index.js";

config();

export const user_activity = async (req, res) => {
  const CLERK_WEBHOOK_SIGNING_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!CLERK_WEBHOOK_SIGNING_SECRET) {
    throw new Error("You need a CLERK_WEBHOOK_SIGNING_SECRET in your .env");
  }
  const headers = req.headers;
  const payload = req.body;
  const svix_id = headers["svix-id"];
  const svix_timestamp = headers["svix-timestamp"];
  const svix_signature = headers["svix-signature"];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }
  // https://clerk.com/docs/integrations/webhooks/sync-data || for learning purpose visit
  const wh = new Webhook(CLERK_WEBHOOK_SIGNING_SECRET);

  let evt;
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.log("Error verifying webhook:", err.message);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  const { id } = evt.data;
  const eventType = evt.type;
  try {
    if (eventType === "user.created") {
      await user_created(evt.data);
    }
    if (eventType === "session.created") {
    }

    return res.status(200).json({
      success: true,
      message: "Webhook received",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "DataBase issue",
    });
  }
};

const user_created = async (data) => {
  try {
    const { first_name, id, profile_image_url, email_addresses } = data;

    await db.insert(users).values({
      user_id: id,
      name: first_name,
      email: email_addresses[0]?.email_address ?? "",
      profileCompleted: 0,
      profilePicture: profile_image_url ?? "",
    });
  } catch (error) {
    console.log(error);
  }
};
