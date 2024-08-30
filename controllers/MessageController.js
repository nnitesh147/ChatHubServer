import connectDb from "../db2/index.js";
import MessageModel from "../db2/models/messages.js";
import GeminiMessageModel from "../db2/models/geminimessages.js";
import { uploadtoS3 } from "../utils/AWS.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";

import { db } from "../db/index.js";
import { users } from "../db/schema/users.js";
import { eq } from "drizzle-orm";

config();

export const addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req?.body;
    if (!from || !to || !message) {
      return res.status(404).json({
        status: false,
        authentic: true,
        data: { from, to, message },
        message: "Data in-sufficient",
      });
    }
    await connectDb();

    const sender = await db.select().from(users).where(eq(users.user_id, from));
    const reciever = await db.select().from(users).where(eq(users.user_id, to));

    const getuser = global.onlineUsers.get(to);
    const data = await MessageModel.insertMany({
      messageStatus: getuser ? "delivered" : "sent",
      messageContent: message,
      messageType: "text",
      senderId: from,
      recieverId: to,
      createdAt: Date.now(),
      sender: sender[0],
      reciever: reciever[0],
    });

    return res.status(200).json({
      status: true,
      authentic: true,
      data: data,
      message: "Succesfully-Sent",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      authentic: true,
      data: {},
      message: "Internal-Server error",
    });
  }
};

export const getMessage = async (req, res, next) => {
  try {
    const { from, to } = req.params;

    if (!from || !to) {
      return res.status(404).json({
        status: false,
        authentic: true,
        data: { from, to },
        message: "Data in-sufficient",
      });
    }

    await connectDb();
    const data = await MessageModel.find({
      $or: [
        {
          senderId: from,
          recieverId: to,
        },
        {
          senderId: to,
          recieverId: from,
        },
      ],
    }).sort({ createdAt: 1 });

    const unReadMessages = [];

    data.forEach((message, index) => {
      if (message.messageStatus !== "read" && message.senderId === to) {
        data[index].messageStatus = "read";
        unReadMessages.push(message._id);
      }
    });

    await MessageModel.updateMany(
      { _id: { $in: unReadMessages } },
      {
        $set: {
          messageStatus: "read",
        },
      }
    );

    return res.status(200).json({
      status: true,
      authentic: true,
      data: data,
      message: "Succesfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      authentic: true,
      data: {},
      message: "Internal-Server error",
    });
  }
};

export const addImageMessage = async (req, res, next) => {
  try {
    if (req.file) {
      const { originalname, path, mimetype } = req.file;

      const url = await uploadtoS3(path, originalname, mimetype);

      if (url == "error") {
        return res.status(500).json({
          status: false,
          authentic: true,
          data: {},
          message: "Internal Server Error in AWS",
        });
      }
      const { from, to } = req.query;

      if (!from || !to) {
        return res.status(404).json({
          status: false,
          authentic: true,
          data: {},
          message: "No-sender and reciever  Id",
        });
      }

      await connectDb();

      const sender = await db
        .select()
        .from(users)
        .where(eq(users.user_id, from));
      const reciever = await db
        .select()
        .from(users)
        .where(eq(users.user_id, to));

      const getuser = global.onlineUsers.get(to);
      const message = await MessageModel.create({
        messageStatus: getuser ? "delivered" : "sent",
        messageContent: url,
        messageType: "image",
        senderId: from,
        recieverId: to,
        createdAt: Date.now(),
        sender: sender[0],
        reciever: reciever[0],
      });
      return res.status(200).json({
        status: true,
        authentic: true,
        data: message,
        message: "Succesfully-Sent",
      });
    }
    return res.status(404).json({
      status: false,
      authentic: true,
      data: {},
      message: "No-file",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      authentic: true,
      data: {},
      message: "Internal Server Error",
    });
  }
};

export const getInitialContactswithMessages = async (req, res, next) => {
  try {
    const { userId } = req.params;

    await connectDb();

    /// data base - change hone ke baad ek query m dono aayega kunki each contact will store all sent and recieved message
    const messages = await MessageModel.find({
      $or: [{ senderId: userId }, { recieverId: userId }],
    }).sort({
      createdAt: -1,
    });
    const usersMap = new Map();
    const messageStatusChange = [];

    messages.forEach((msg) => {
      const isSender = msg.senderId === userId;
      const calculatedId = isSender ? msg.recieverId : msg.senderId;
      if (msg.messageStatus === "sent" && !isSender) {
        messageStatusChange.push(msg._id);
      }

      const {
        _id,
        senderId,
        recieverId,
        messageStatus,
        messageContent,
        messageType,
        createdAt,
        sender,
        reciever,
      } = msg;

      if (!usersMap.has(calculatedId)) {
        let user = {
          messageId: _id,
          senderId,
          recieverId,
          messageStatus,
          messageContent,
          messageType,
          createdAt,
          sender,
          reciever,
        };
        if (isSender) {
          user = {
            ...user,
            totalunreadMessages: 0,
          };
        } else {
          user = {
            ...user,
            totalUnreadMessages: messageStatus !== "read" ? 1 : 0,
          };
        }
        usersMap.set(calculatedId, { ...user });
      } else if (messageStatus !== "read" && !isSender) {
        const user = usersMap.get(calculatedId);
        usersMap.set(calculatedId, {
          ...user,
          totalUnreadMessages: user.totalUnreadMessages + 1,
        });
      }
    });
    if (messageStatusChange.length) {
      await MessageModel.updateMany(
        { _id: { $in: messageStatusChange } },
        {
          $set: {
            messageStatus: "delivered",
          },
        }
      );
    }
    return res.status(200).json({
      status: true,
      authentic: true,
      data: {
        users: Array.from(usersMap.values()),
        onlineUsers: Array.from(onlineUsers.keys()),
      },
      message: "Successfully fetched Contacts",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      authentic: true,
      data: {},
      message: "Internal Server Error",
    });
  }
};

export const sendMessageToGemini = async (req, res, next) => {
  try {
    const { from, prompt } = req.body;
    await connectDb();
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);

    const text = result.response.text();

    if (!text) {
      return res.status(404).json({
        status: false,
        authentic: true,
        data: { from },
        message: "Some error from google",
      });
    }

    await GeminiMessageModel.insertMany([
      {
        senderId: from,
        recieverId: "MyAi.12.123",
        prompt: prompt,
        promptResult: prompt,
        createdAt: Date.now(),
      },
      {
        senderId: "MyAi.12.123",
        recieverId: from,
        prompt: prompt,
        promptResult: text,
        createdAt: Date.now(),
      },
    ]);

    const data = [
      {
        senderId: from,
        recieverId: "MyAi.12.123",
        prompt: prompt,
        promptResult: prompt,
        createdAt: Date.now(),
      },
      {
        senderId: "MyAi.12.123",
        recieverId: from,
        prompt: prompt,
        promptResult: text,
        createdAt: Date.now(),
      },
    ];

    return res.status(200).json({
      status: true,
      authentic: true,
      data: data,
      message: "Successfull result",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      authentic: true,
      data: {},
      message: "Internal Server error",
    });
  }
};

export const getAllGeminiMessage = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(404).json({
        status: false,
        authentic: true,
        data: {},
        message: "Data in-sufficient",
      });
    }

    await connectDb();
    const data = await GeminiMessageModel.find({
      $or: [
        {
          senderId: userId,
          recieverId: "MyAi.12.123",
        },
        {
          senderId: "MyAi.12.123",
          recieverId: userId,
        },
      ],
    }).sort({ createdAt: 1 });
    return res.status(200).json({
      status: true,
      authentic: true,
      data: data,
      message: "Succesfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      authentic: true,
      data: {},
      message: "Internal-Server error",
    });
  }
};
