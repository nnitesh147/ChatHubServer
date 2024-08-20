import { db } from "../db/index.js";
import { users } from "../db/schema/index.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const { userId } = req.auth;

    const allUsers = await db.select().from(users).orderBy(users.name);

    const groupByInitialLetter = {};

    allUsers.forEach((user) => {
      if (user.user_id !== userId) {
        const initialLetter = user.name.charAt(0).toUpperCase();

        if (!groupByInitialLetter[initialLetter]) {
          groupByInitialLetter[initialLetter] = [];
        }

        groupByInitialLetter[initialLetter].push(user);
      }
    });

    return res.status(200).json({
      status: true,
      message: "Successfully fetched all users",
      data: groupByInitialLetter,
      authentic: true,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal Server error",
      data: {},
      authentic: true,
    });
  }
};
