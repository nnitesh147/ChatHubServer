import mongoose from "mongoose";

import { config } from "dotenv";

config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_MONGO_URL, {
      dbName: "ChatHub",
    });
    console.log("MongoDb Connected Successfully");
  } catch (error) {
    console.log(error);
  }
};
export default connectDB;
