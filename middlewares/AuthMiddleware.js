export const authMiddleware = (req, res, next) => {
  if (req.auth.userId == null) {
    return res.status(404).json({
      message: "Not Authenticated",
      status: false,
      data: {},
      authentic: false,
    });
  }

  next();
};
