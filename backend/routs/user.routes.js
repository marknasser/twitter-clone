import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  getUserProfile,
  followUnfollowUser,
  getSuggestedUsers,
  updateUser,
} from "../controllers/user.controller.js";

const router = express.Router();

router.use("/", protectRoute);
router.get("/profile/:username", getUserProfile);
router.get("/suggested", getSuggestedUsers);
router.post("/follow/:id", followUnfollowUser);
router.post("/update", updateUser);
// router.delete("/deleteMe");

export default router;
