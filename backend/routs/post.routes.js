import express from "express";

import {
  createPost,
  deletePost,
  commentOnPost,
  likeUnlikePost,
  getAllPosts,
  getLikedPosts,
  getFollowingPosts,
  getUserPosts,
} from "../controllers/post.controller.js";

import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.use(protectRoute);

router.route("/").post(createPost).get(getAllPosts);
router.route("/:id").delete(deletePost);
router.post("/like/:id", likeUnlikePost);
router.get("/likes/:id", getLikedPosts);
router.post("/comment/:id", commentOnPost);
router.get("/following", getFollowingPosts);
router.get("/user/:username", getUserPosts);

export default router;
