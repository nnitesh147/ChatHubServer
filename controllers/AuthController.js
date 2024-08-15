import { db } from "../db/index.js";
import { eq, lt, gte, ne } from "drizzle-orm";
import { users } from "../db/schema/users.js";

export const checkUser = async (req, res, next) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.json({
      message: "No user_id provided",
      status: false,
      authentic: true,
    });
  }
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.user_id, user_id));

    if (user.length == 0) {
      return res.json({
        message: "No user_id found",
        status: false,
        data: user,
        authentic: true,
      });
    }

    if (user[0].profileCompleted) {
      return res.json({
        message: "Profile is complete",
        status: true,
        data: user,
        authentic: true,
      });
    }
    return res.json({
      message: "Profile is not complete",
      status: false,
      data: user,
      authentic: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Some error in our server check-user",
      status: false,
      data: {},
      authentic: true,
    });
  }
};

export const onBoardUser = async (req, res, next) => {
  const { user_id, name, email, about, image: profilePicture } = req.body;

  if (!user_id || !email || !name) {
    return res.status(404).json({
      status: false,
      message: "Data is in-sufficient",
      data: { email, name, about, user_id },
      authentic: true,
    });
  }

  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.user_id, user_id));

    let userInfo = null;

    if (user.length > 0) {
      userInfo = await db
        .update(users)
        .set({
          name: name,
          email: email,
          about: about,
          profilePicture: profilePicture,
          profileCompleted: true,
        })
        .where(eq(user[0].user_id, user_id));
    } else {
      userInfo = await db.insert(users).values({
        name: name,
        email: email,
        about: about,
        profileCompleted: true,
        profilePicture: profilePicture,
        user_id: user_id,
      });
    }
    return res.status(200).json({
      status: true,
      message: "Data Saved Successfully",
      data: userInfo,
      authentic: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      data: {},
      authentic: true,
    });
  }
};
