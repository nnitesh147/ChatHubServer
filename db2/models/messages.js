import { date } from "drizzle-orm/mysql-core";
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: String,
  recieverId: String,
  messageType: String,
  messageContent: String,
  messageStatus: {
    type: String,
    default: "sent",
  },
  createdAt: {
    type: Number,
  },
});

const MessageModel = mongoose.model("message", messageSchema);

export default MessageModel;
