import { date } from "drizzle-orm/mysql-core";
import { boolean } from "drizzle-orm/pg-core";
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
  sender: {
    name: String,
    user_id: String,
    profilePicture: String,
    profileCompleted: boolean,
    email: String,
    about: String,
    createdAt: Number,
  },
  reciever: {
    name: String,
    user_id: String,
    profilePicture: String,
    profileCompleted: boolean,
    email: String,
    about: String,
    createdAt: Number,
  },
});

const MessageModel = mongoose.model("message", messageSchema);

export default MessageModel;
