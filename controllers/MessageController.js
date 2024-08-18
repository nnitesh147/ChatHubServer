import connectDb from "../db2/index.js";
import MessageModel from "../db2/models/messages.js";

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
    const getuser = global.onlineUsers.get(to);
    const data = await MessageModel.insertMany({
      messageStatus: getuser ? "delivered" : "sent",
      messageContent: message,
      messageType: "text",
      senderId: from,
      recieverId: to,
      createdAt: Date.now(),
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
      data: { from, to },
      message: "Internal-Server error",
    });
  }
};
