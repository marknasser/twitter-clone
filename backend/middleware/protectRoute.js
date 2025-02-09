import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized: No Token Provided" });
    }

    const currentUser = await User.findById(decoded.userId).select("-password"); // we have added the user id into the token

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }
    // then add the currentUser object to req object so we can accecc it
    req.currentUser = currentUser;
    next();
  } catch (error) {
    console.log("Error protectRoute", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
