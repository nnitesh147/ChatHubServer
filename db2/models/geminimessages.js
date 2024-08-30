import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: String,
  recieverId: String,
  prompt: String,
  promptResult: String,
  createdAt: {
    type: Number,
  },
});

const GeminiMessageModel = mongoose.model("geminiMessages", messageSchema);

export default GeminiMessageModel;
